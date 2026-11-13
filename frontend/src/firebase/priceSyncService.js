/**
 * priceSyncService.js
 * Fetches today's vegetable prices from vegetablemarketprice.com (Bhiwani)
 * and updates Firebase inventory prices for all products that have a `marketId`.
 *
 * Price logic:
 *   1. Base rate per 1 kg = HIGHER (maximum) value of API retailprice range
 *      (e.g. "23 - 29" -> 29 / kg)
 *   2. Unit conversion:
 *      Converted base = Math.round(Base rate * (Item weight in gm / 1000 gm))
 *      - e.g. 29/kg for 250 gm -> Math.round(29 * 250 / 1000) = 7
 *      - e.g. 29/kg for 500 gm -> Math.round(29 * 500 / 1000) = 15
 *      - e.g. 29/kg for 1 kg   -> Math.round(29 * 1000 / 1000) = 29
 *   3. Margins & Old Price:
 *      priceInstant = Converted base + margin % (rounded)
 *      priceMorning = Converted base + margin % (rounded)
 *      oldPrice     = Calculated higher MRP (e.g. ~15-20% above instant or base)
 *   4. Discount label:
 *      Auto calculated percentage difference between oldPrice and priceInstant
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const INVENTORY_DOC = doc(db, 'inventory', 'menu');

// ── API URL builders ──────────────────────────────────────────────────────────
function buildVegetablesApiUrl(date) {
  const directUrl = `https://vegetablemarketprice.com/api/dataapi/market/bhiwani/daywisedata?date=${date}`;
  if (import.meta.env.DEV) {
    return `/mandi-api/api/dataapi/market/bhiwani/daywisedata?date=${date}`;
  }
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
}

function buildFruitsApiUrl(date) {
  const directUrl = `https://vegetablemarketprice.com/api/dataapi/fruits/westbengal/daywisedata?date=${date}`;
  if (import.meta.env.DEV) {
    return `/fruits-api/api/dataapi/fruits/westbengal/daywisedata?date=${date}`;
  }
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

// ── Parse "23 - 29" -> { low: 23, high: 29, max: 29 } ─────────────────────────
function parseRetailRange(str) {
  if (!str) return null;
  const parts = String(str).split('-').map(s => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return {
      low: Math.min(parts[0], parts[1]),
      high: Math.max(parts[0], parts[1]),
      max: Math.max(parts[0], parts[1])
    };
  }
  const single = parseInt(String(str).trim(), 10);
  if (!isNaN(single)) {
    return { low: single, high: single, max: single };
  }
  return null;
}

// ── Weight conversion ratio & gram detection ──────────────────────────────────
/**
 * Parses weights like "250 gm", "500g", "1 kg", "200 gm", "2 pcs" into:
 * { ratio: multiplier of 1kg, grams: estimated total grams }
 */
function parseWeightInfo(weightStr) {
  if (!weightStr) return { ratio: 1.0, grams: 1000 };
  const s = String(weightStr).toLowerCase().trim();

  // Kilograms: e.g. "1 kg", "2kg", "0.5 kg"
  const kgMatch = s.match(/([\d.]+)\s*kg/);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1]);
    const numKg = !isNaN(val) && val > 0 ? val : 1.0;
    return { ratio: numKg, grams: numKg * 1000 };
  }

  // Grams: e.g. "250 gm", "500g", "100 grams"
  const gmMatch = s.match(/([\d.]+)\s*(gm|g|gram|grams)/);
  if (gmMatch) {
    const val = parseFloat(gmMatch[1]);
    const g = !isNaN(val) && val > 0 ? val : 500;
    return { ratio: g / 1000, grams: g };
  }

  // Count / Pcs: e.g. "2 pcs", "1 pc"
  const pcMatch = s.match(/([\d.]+)\s*(pc|pcs|piece|pieces)/);
  if (pcMatch) {
    const val = parseFloat(pcMatch[1]);
    const count = !isNaN(val) && val > 0 ? val : 1;
    return { ratio: count * 0.25, grams: count * 250 };
  }

  if (s.includes('dozen')) {
    return { ratio: 1.2, grams: 1200 };
  }

  return { ratio: 0.5, grams: 500 };
}

// ── Round up to next multiple of 10 ───────────────────────────────────────────
// e.g. 7 -> 10, 10 -> 10, 16 -> 20, 21 -> 30
function roundUpTo10(num) {
  if (num <= 0) return 10;
  return Math.ceil(num / 10) * 10;
}

// ── Add margin % and round ────────────────────────────────────────────────────
function applyMargin(base, marginPct, isUnderOrEqualTo500g = false) {
  const pct = parseFloat(marginPct) || 0;
  const rawWithMargin = base + (base * pct / 100);

  // If item is up to 500g (e.g. 50g, 100g, 200g, 250g, 500g), round UP to next multiple of 10
  if (isUnderOrEqualTo500g) {
    return roundUpTo10(rawWithMargin);
  }

  // Above 500g (e.g. 1 kg+): standard rounding to nearest Rs 1
  return Math.max(1, Math.round(rawWithMargin));
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

  // 1. Fetch today's API data (Vegetables + Fruits)
  const dateStr = todayString();
  const mandiMap = {};

  // Fetch Vegetables (Bhiwani)
  try {
    const vegUrl = buildVegetablesApiUrl(dateStr);
    const res = await fetch(vegUrl);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        for (const item of json.data) {
          mandiMap[item.id] = { ...item, _type: 'vegetable' };
        }
      }
    }
  } catch (err) {
    console.warn('Vegetable API fetch error:', err);
    result.errors.push('Could not fetch vegetables API: ' + err.message);
  }

  // Fetch Fruits (West Bengal / National rates)
  try {
    const fruitUrl = buildFruitsApiUrl(dateStr);
    const res = await fetch(fruitUrl);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        for (const item of json.data) {
          mandiMap[item.id] = { ...item, _type: 'fruit' };
        }
      }
    }
  } catch (err) {
    console.warn('Fruits API fetch error:', err);
    result.errors.push('Could not fetch fruits API: ' + err.message);
  }

  if (Object.keys(mandiMap).length === 0) {
    throw new Error('Could not reach Mandi APIs. Please check internet connection.');
  }

  // 2. Fetch current Firestore inventory
  const snap = await getDoc(INVENTORY_DOC);
  if (!snap.exists()) throw new Error('Inventory document not found in Firestore.');
  const menuObj = snap.data().menu;

  // 3. Walk every product, update if it has a marketId that exists in API
  const updatedMenu = {};
  for (const [category, items] of Object.entries(menuObj)) {
    updatedMenu[category] = items.map(product => {
      if (!product.marketId) {
        result.skipped++;
        return product; // no marketId -> skip
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

      // Pick MAXIMUM retail price for 1 kg
      // For Fruits: user requested adding ₹10 to the max retail price
      const isFruit = category === 'fruits' || apiItem._type === 'fruit';
      const maxRetailPerKg = range.max + (isFruit ? 10 : 0);

      // Convert proportionally to product's weight in DB
      const weightInfo = parseWeightInfo(product.weight);
      // Items up to 500 grams (50g, 100g, 200g, 250g, 500g, etc.)
      const isUnderOrEqualTo500g = weightInfo.grams > 0 && weightInfo.grams <= 500;

      // Raw converted price before margin
      const convertedBasePrice = Math.max(1, maxRetailPerKg * weightInfo.ratio);

      // Calculate instant & morning prices with user margins
      // Items up to 500g are rounded UP to next multiple of 10
      const priceInstant = applyMargin(convertedBasePrice, instantMargin, isUnderOrEqualTo500g);
      const priceMorning = applyMargin(convertedBasePrice, morningMargin, isUnderOrEqualTo500g);

      // MRP / oldPrice: mark up over instant price (rounded nicely)
      const rawOldPrice = isUnderOrEqualTo500g ? priceInstant + 10 : Math.max(priceInstant + 2, Math.round(priceInstant * 1.25));
      const oldPrice = isUnderOrEqualTo500g ? roundUpTo10(rawOldPrice) : rawOldPrice;
      const discount = calcDiscount(priceInstant, oldPrice);

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

  // 4. Save back to Firestore
  await setDoc(INVENTORY_DOC, {
    menu: updatedMenu,
    updatedAt: serverTimestamp(),
    lastPriceSync: dateStr,
  });

  return result;
}
