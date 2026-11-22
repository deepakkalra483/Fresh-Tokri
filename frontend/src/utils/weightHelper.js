/**
 * weightHelper.js
 * Utility to parse weights, calculate prices for custom/selected weights or pieces,
 * and generate available variant choices for products.
 */

/**
 * Checks if a product unit is piece/packet based rather than weight (grams/kg)
 */
export function isPieceBasedProduct(weightStr) {
  if (!weightStr) return false;
  const s = String(weightStr).toLowerCase().trim();
  return (
    s.includes('pc') ||
    s.includes('pcs') ||
    s.includes('piece') ||
    s.includes('pieces') ||
    s.includes('packet') ||
    s.includes('pack') ||
    s.includes('box') ||
    s.includes('dozen')
  );
}

/**
 * Extracts base count for piece-based items (e.g. "2 pcs" -> 2, "1 pc" -> 1)
 */
export function getBasePieceCount(weightStr) {
  if (!weightStr) return 1;
  if (typeof weightStr === 'number') return weightStr;
  const s = String(weightStr).toLowerCase().trim();
  const match = s.match(/([\d.]+)\s*(pc|pcs|piece|pieces|packet|pack|box)/);
  if (match) {
    const val = parseFloat(match[1]);
    return !isNaN(val) && val > 0 ? val : 1;
  }
  if (s.includes('dozen')) return 12;
  const pureNum = parseFloat(s);
  if (!isNaN(pureNum) && pureNum > 0) return pureNum;
  return 1;
}

/**
 * Extracts base grams for weight-based items (e.g. "500 gm" -> 500, "1 kg" -> 1000)
 */
export function getBaseGrams(weightStr) {
  if (!weightStr) return 1000;
  if (typeof weightStr === 'number') return weightStr;
  const s = String(weightStr).toLowerCase().trim();

  const kgMatch = s.match(/([\d.]+)\s*kg/);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1]);
    return !isNaN(val) && val > 0 ? val * 1000 : 1000;
  }

  const gmMatch = s.match(/([\d.]+)\s*(gm|g|gram|grams)/);
  if (gmMatch) {
    const val = parseFloat(gmMatch[1]);
    return !isNaN(val) && val > 0 ? val : 500;
  }

  const pureNum = parseFloat(s);
  if (!isNaN(pureNum) && pureNum > 0) {
    return pureNum;
  }

  return 1000;
}

/**
 * Calculates rate for a target weight or count relative to product's base weight and unit price.
 * User rules:
 *   - 1 kg rate is rounded off to multiple of 10.
 *   - Other weights are converted from 1 kg rate WITHOUT round off to 10:
 *     - Target weight <= 300g (e.g. 250 gm, 100 gm): proportional + 50% (proportional * 1.5)
 *     - Target weight 300g to 500g (e.g. 500 gm): proportional + 30% (proportional * 1.3)
 *     - Target weight > 500g (e.g. 1 kg, 2 kg): exact proportional from 1 kg rate
 */
export function calculateVariantPrice(basePrice, baseWeightStr, targetWeightStr, marketPrice1Kg = null) {
  if (!basePrice || basePrice <= 0) return 0;

  if (isPieceBasedProduct(baseWeightStr)) {
    const baseCount = getBasePieceCount(baseWeightStr);
    const targetCount = getBasePieceCount(targetWeightStr);
    const pricePerUnit = basePrice / baseCount;
    return Math.max(1, Math.round(pricePerUnit * targetCount));
  }

  // Weight based
  const baseGrams = getBaseGrams(baseWeightStr);
  const targetGrams = getBaseGrams(targetWeightStr);

  // Determine true 1kg rate (rounded to multiple of 10)
  let ratePerKg = marketPrice1Kg;
  if (!ratePerKg || ratePerKg <= 0) {
    if (baseGrams > 500) {
      ratePerKg = Math.max(10, Math.ceil((basePrice / (baseGrams / 1000)) / 10) * 10);
    } else if (baseGrams <= 300) {
      const raw1Kg = (basePrice / 1.5) / (baseGrams / 1000);
      ratePerKg = Math.max(10, Math.ceil(raw1Kg / 10) * 10);
    } else {
      // 300 < baseGrams <= 500
      const raw1Kg = (basePrice / 1.3) / (baseGrams / 1000);
      ratePerKg = Math.max(10, Math.ceil(raw1Kg / 10) * 10);
    }
  }

  // Proportional rate for target grams from 1 kg
  const proportionalPrice = (ratePerKg / 1000) * targetGrams;

  // 1. Target weight <= 300g (e.g. 250 gm, 100 gm): proportional + 50% (no round off to 10)
  if (targetGrams <= 300) {
    return Math.max(1, Math.round(proportionalPrice * 1.5));
  }

  // 2. Target weight between 300g and 500g (e.g. 500 gm): proportional + 30% (no round off to 10)
  if (targetGrams <= 500) {
    return Math.max(1, Math.round(proportionalPrice * 1.3));
  }

  // 3. Target weight > 500g (e.g. 1 kg, 2 kg): exact proportional rate (no round off to 10)
  return Math.max(1, Math.round(proportionalPrice));
}

/**
 * Generates options for the weight selector modal
 */
export function getAvailableVariants(product, currentPrice) {
  const baseWeight = product.weight || '500 gm';
  const marketPrice1Kg = product.marketPrice1Kg || null;

  if (isPieceBasedProduct(baseWeight)) {
    // Pieces options
    const pieceOptions = ['1 pc', '2 pcs', '3 pcs', '4 pcs'];
    return pieceOptions.map((opt) => ({
      weight: opt,
      price: calculateVariantPrice(currentPrice, baseWeight, opt, marketPrice1Kg),
      isPiece: true,
      count: getBasePieceCount(opt),
    }));
  }

  // Weight options: 250 gm, 500 gm, 1 kg, 2 kg
  const weightOptions = ['250 gm', '500 gm', '1 kg', '2 kg'];
  return weightOptions.map((opt) => ({
    weight: opt,
    price: calculateVariantPrice(currentPrice, baseWeight, opt, marketPrice1Kg),
    isPiece: false,
    grams: getBaseGrams(opt),
  }));
}
