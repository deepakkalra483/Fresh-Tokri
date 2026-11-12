/**
 * priceSyncService.js
 * Fetches today's vegetable prices from vegetablemarketprice.com (Bhiwani)
 * and updates Firebase inventory prices for all products that have a `marketId`.
 *
 * Price logic:
 *   base price     = lower value of API retailprice range (e.g. "50 - 59" → 50)
 *   oldPrice       = higher value of API retailprice range (e.g. "50 - 59" → 59)
 *
 *   priceInstant   = base + (base × instantMargin / 100)  → rounded to nearest ₹1
 *   priceMorning   = base + (base × morningMargin / 100)  → rounded to nearest ₹1
 *
 *   If margin = 0, just use base directly.
 *
 * discount label   = auto-calculated from oldPrice vs priceInstant
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const INVENTORY_DOC = doc(db, 'inventory', 'menu');

// ── API URL builder ───────────────────────────────────────────────────────────
// In dev: uses Vite proxy (/mandi-api) → no CORS issues
// In prod: uses allorigins.win as a free CORS proxy wrapper
function buildApiUrl(date) {
  const directUrl = `https://vegetablemarketprice.com/api/dataapi/market/bhiwani/daywisedata?date=${date}`;
  if (import.meta.env.DEV) {
    // Vite dev server proxies /mandi-api → vegetablemarketprice.com
    return `/mandi-api/api/dataapi/market/bhiwani/daywisedata?date=${date}`;
  }
  // Production: wrap with allorigins CORS proxy
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
}

// ── Get today's date string in YYYY-MM-DD ─────────────────────────────────────
function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ── Parse "50 - 59" → { low: 50, high: 59 } ──────────────────────────────────
function parseRetailRange(str) {
  if (!str) return null;
  const parts = String(str).split('-').map(s => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { low: parts[0], high: parts[1] };
  }
  return null;
}

// ── Add margin % and round ────────────────────────────────────────────────────
function applyMargin(base, marginPct) {
  const pct = parseFloat(marginPct) || 0;
  return Math.round(base + (base * pct / 100));
}

// ── Auto discount label ───────────────────────────────────────────────────────
function calcDiscount(priceInstant, oldPrice) {
  if (!oldPrice || oldPrice <= priceInstant) return '';
  const pct = Math.round(((oldPrice - priceInstant) / oldPrice) * 100);
  return pct > 0 ? `${pct}% OFF` : '';
}

// ── Main sync function ─────────────────────────────────────────────────────────
/**
 * @param {number|string} instantMargin  - % markup on instant price (0 = no markup)
 * @param {number|string} morningMargin  - % markup on morning price (0 = no markup)
 * @returns {Promise<{ updated: number, skipped: number, errors: string[] }>}
 */
export async function syncPricesFromMandi(instantMargin = 0, morningMargin = 0) {
  const result = { updated: 0, skipped: 0, errors: [] };

  // 1. Fetch today's API data
  const dateStr = todayString();
  let apiData;
  try {
    const url = buildApiUrl(dateStr);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Server replied with status ${res.status} ${res.statusText}`);
    const json = await res.json();
    if (!json?.data || !Array.isArray(json.data)) {
      throw new Error('API response has no data array — format may have changed');
    }
    apiData = json.data;
  } catch (err) {
    // Give a clear, actionable error message
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(
        'Could not reach Bhiwani Mandi API. ' +
        'Make sure your dev server is running (npm run dev) and internet is connected.'
      );
    }
    throw new Error(`Mandi API error: ${err.message}`);
  }

  // 2. Build a lookup map: marketId → { price, retailprice }
  const mandiMap = {};
  for (const item of apiData) {
    mandiMap[item.id] = item;
  }

  // 3. Fetch current Firestore inventory
  const snap = await getDoc(INVENTORY_DOC);
  if (!snap.exists()) throw new Error('Inventory document not found in Firestore.');
  const menuObj = snap.data().menu;

  // 4. Walk every product, update if it has a marketId that exists in API
  const updatedMenu = {};
  for (const [category, items] of Object.entries(menuObj)) {
    updatedMenu[category] = items.map(product => {
      if (!product.marketId) {
        result.skipped++;
        return product; // no marketId → skip
      }

      const apiItem = mandiMap[product.marketId];
      if (!apiItem) {
        result.skipped++;
        result.errors.push(`No API data for marketId: "${product.marketId}" (${product.name})`);
        return product;
      }

      const range = parseRetailRange(apiItem.retailprice);
      if (!range) {
        result.skipped++;
        result.errors.push(`Could not parse retailprice for "${product.name}": ${apiItem.retailprice}`);
        return product;
      }

      const basePrice    = range.low;
      const oldPrice     = range.high;
      const priceInstant = applyMargin(basePrice, instantMargin);
      const priceMorning = applyMargin(basePrice, morningMargin);
      const discount     = calcDiscount(priceInstant, oldPrice);

      result.updated++;
      return {
        ...product,
        priceInstant,
        priceMorning,
        oldPrice,
        discount,
      };
    });
  }

  // 5. Save back to Firestore
  await setDoc(INVENTORY_DOC, {
    menu: updatedMenu,
    updatedAt: serverTimestamp(),
    lastPriceSync: dateStr,
  });

  return result;
}
