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
import { db } from './config.js';

const INVENTORY_DOC = doc(db, 'inventory', 'menu');

// ── Multi-endpoint robust fetch ──────────────────────────────────────────────
async function fetchEndpointData(candidateUrls) {
  let lastError = null;
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          if (Array.isArray(json?.data) && json.data.length > 0) {
            return json.data;
          }
        }
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Could not fetch data from any candidate endpoint');
}

async function fetchVegetablesData(dateStr) {
  const urls = [
    `/api/mandi?date=${dateStr}`,
    `/mandi-api/api/dataapi/market/bhiwani/daywisedata?date=${dateStr}`,
    `https://vegetablemarketprice.com/api/dataapi/market/bhiwani/daywisedata?date=${dateStr}`,
  ];
  return fetchEndpointData(urls);
}

async function fetchFruitsData(dateStr) {
  const urls = [
    `/api/fruits?date=${dateStr}`,
    `/fruits-api/api/dataapi/fruits/westbengal/daywisedata?date=${dateStr}`,
    `https://vegetablemarketprice.com/api/dataapi/fruits/westbengal/daywisedata?date=${dateStr}`,
  ];
  return fetchEndpointData(urls);
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

// ── Calculate price based on user-defined weight pricing logic ────────────────
/**
 * Rule:
 *  - 1 kg base rate = max retail price from API + user input percentage margin
 *  - If weight <= 300g: proportional price is doubled, rounded up to next multiple of 10
 *  - If weight between 300g and 500g (e.g. 500 gm): proportional price + 10 rupees, rounded up to next multiple of 10
 *  - If weight > 500g (e.g. 1 kg, 2 kg): standard proportional price (rate1Kg) without extra 10 rupees
 */
function computePriceForWeight(maxRetailPerKg, marginPct, weightInfo) {
  const pct = parseFloat(marginPct) || 0;
  const rate1Kg = maxRetailPerKg + (maxRetailPerKg * pct / 100);

  // Piece-based items (e.g. 1 pc, 2 pcs)
  if (!weightInfo.grams || weightInfo.grams === 0) {
    const raw = rate1Kg * (weightInfo.ratio || 0.5);
    return Math.max(1, Math.round(raw));
  }

  const grams = weightInfo.grams;
  const proportional = (rate1Kg / 1000) * grams;

  // 1. Less than or equal to 300 grams (e.g. 100g, 250g) -> doubled, ceiling to multiple of 10
  if (grams <= 300) {
    const doubled = proportional * 2;
    return Math.max(10, Math.ceil(doubled / 10) * 10);
  }

  // 2. Between 300 grams and 500 grams (e.g. 500 gm) -> increase 10 rupees, ceiling to multiple of 10
  if (grams <= 500) {
    const withTen = proportional + 10;
    return Math.max(10, Math.ceil(withTen / 10) * 10);
  }

  // 3. More than 500 grams (e.g. 1 kg, 2 kg) -> standard proportional rate (1 kg = rate1Kg)
  return Math.max(1, Math.round(proportional));
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
    const vegData = await fetchVegetablesData(dateStr);
    if (Array.isArray(vegData)) {
      for (const item of vegData) {
        mandiMap[item.id] = { ...item, _type: 'vegetable' };
      }
    }
  } catch (err) {
    console.warn('Vegetable API fetch error:', err);
    result.errors.push('Could not fetch vegetables API: ' + err.message);
  }

  // Fetch Fruits (West Bengal / National rates)
  try {
    const fruitData = await fetchFruitsData(dateStr);
    if (Array.isArray(fruitData)) {
      for (const item of fruitData) {
        mandiMap[item.id] = { ...item, _type: 'fruit' };
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

      // Compute instant and morning prices with new pricing formula
      const priceInstant = computePriceForWeight(maxRetailPerKg, instantMargin, weightInfo);
      const priceMorning = computePriceForWeight(maxRetailPerKg, morningMargin, weightInfo);

      // 1kg rate for reference and variant calculation
      const rate1KgInstant = maxRetailPerKg + (maxRetailPerKg * (parseFloat(instantMargin) || 0) / 100);

      // MRP / oldPrice: mark up over instant price
      const isUnder500g = weightInfo.grams <= 500;
      const oldPrice = isUnder500g
        ? priceInstant + 10
        : Math.max(priceInstant + 10, Math.round(priceInstant * 1.2));
      const discount = calcDiscount(priceInstant, oldPrice);

      result.updated++;
      return {
        ...product,
        priceInstant,
        priceMorning,
        oldPrice,
        discount,
        marketPrice1Kg: Math.round(rate1KgInstant),
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
