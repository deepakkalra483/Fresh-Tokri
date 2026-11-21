/**
 * rateCardImageGenerator.js
 * Generates an Excel-style high-definition rate sheet image (PNG)
 * with columns: Item Name, 250 gm, 500 gm, 1 kg, 2 kg
 * and handles sharing directly to WhatsApp or downloading the PNG.
 */

import { calculateVariantPrice, isPieceBasedProduct } from './weightHelper';

/**
 * Creates an HTML5 canvas and draws the Excel-style price list table
 */
export function generateRateCardCanvas(items, { categoryTitle = 'Vegetables', dateStr } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const today = new Date();
  const displayDate = dateStr || today.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Check if mostly piece items
  const isMostlyPiece = items.length > 0 && items.every((i) => isPieceBasedProduct(i.weight));
  const colLabels = isMostlyPiece
    ? ['Item Name', '1 pc', '2 pcs', '3 pcs', '4 pcs']
    : ['Item Name', '250 gm', '500 gm', '1 kg', '2 kg'];
  const colVariants = isMostlyPiece
    ? ['1 pc', '2 pcs', '3 pcs', '4 pcs']
    : ['250 gm', '500 gm', '1 kg', '2 kg'];

  // Dimensions (Base 1x coordinates, rendered at 2x scale for ultra-crisp HD text)
  const scale = 2;
  const width = 840;
  const headerHeight = 110;
  const tableHeaderHeight = 44;
  const rowHeight = 40;
  const footerHeight = 65;
  const totalHeight = headerHeight + tableHeaderHeight + items.length * rowHeight + footerHeight;

  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  ctx.scale(scale, scale);

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalHeight);

  // ── Top Header Banner ─────────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#064e3b'); // Emerald 900
  grad.addColorStop(1, '#047857'); // Emerald 700
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, headerHeight);

  // Store Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Dr. Bhindi', 24, 40);

  // Subtitle / Category
  ctx.fillStyle = '#6ee7b7'; // Emerald 300
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    `TODAY'S FRESH RATES • ${categoryTitle.toUpperCase()} • ${displayDate.toUpperCase()}`,
    24,
    64
  );

  // Website & Delivery info on top right
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Order: drbhindi.mrfryer.online', width - 24, 38);
  ctx.fillStyle = '#a7f3d0';
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('WhatsApp: +91 8901058909 • Fast Delivery', width - 24, 62);
  ctx.textAlign = 'left';

  // ── Excel Table Grid ──────────────────────────────────────────────────────
  const colX = [
    24,  // Item name start
    380, // Col 1 (250 gm / 1 pc)
    490, // Col 2 (500 gm / 2 pcs)
    600, // Col 3 (1 kg / 3 pcs)
    710, // Col 4 (2 kg / 4 pcs)
    width - 24, // Table right edge
  ];

  const tableTop = headerHeight;

  // Table Header Row Background
  ctx.fillStyle = '#0f172a'; // Slate 900
  ctx.fillRect(24, tableTop, width - 48, tableHeaderHeight);

  // Table Header Borders
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, tableTop, width - 48, tableHeaderHeight);

  // Table Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  // Item Name header
  ctx.fillText(colLabels[0], colX[0] + 14, tableTop + 27);

  // Variant headers (centered in columns)
  for (let c = 0; c < 4; c++) {
    const colCenter = (colX[c + 1] + colX[c + 2]) / 2;
    ctx.textAlign = 'center';
    ctx.fillText(colLabels[c + 1], colCenter, tableTop + 27);
  }
  ctx.textAlign = 'left';

  // ── Table Data Rows ───────────────────────────────────────────────────────
  items.forEach((item, index) => {
    const rowY = tableTop + tableHeaderHeight + index * rowHeight;
    const isEven = index % 2 === 0;

    // Row Background (Alternating like Excel)
    ctx.fillStyle = isEven ? '#ffffff' : '#f8fafc';
    ctx.fillRect(24, rowY, width - 48, rowHeight);

    // Row Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, rowY, width - 48, rowHeight);

    // Vertical column divider lines
    for (let c = 1; c < 5; c++) {
      ctx.beginPath();
      ctx.moveTo(colX[c], rowY);
      ctx.lineTo(colX[c], rowY + rowHeight);
      ctx.stroke();
    }

    // Product Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const nameText = item.name.length > 38 ? item.name.substring(0, 36) + '...' : item.name;
    ctx.fillText(nameText, colX[0] + 14, rowY + 25);

    // 4 Variant Prices
    const baseWeight = item.weight || '500 gm';
    const basePrice = item.priceInstant || 0;
    const market1Kg = item.marketPrice1Kg || null;

    colVariants.forEach((targetWeight, c) => {
      const price = calculateVariantPrice(basePrice, baseWeight, targetWeight, market1Kg);
      const colCenter = (colX[c + 1] + colX[c + 2]) / 2;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#047857'; // Emerald 700
      ctx.font = '800 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`₹${price}`, colCenter, rowY + 25);
    });
    ctx.textAlign = 'left';
  });

  // ── Table Outer Border ────────────────────────────────────────────────────
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, tableTop, width - 48, tableHeaderHeight + items.length * rowHeight);

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = tableTop + tableHeaderHeight + items.length * rowHeight;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, footerY, width, footerHeight);

  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🚚 Free Delivery on orders above ₹179 • Mandi-fresh quality handpicked daily', 24, footerY + 28);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Order online: drbhindi.mrfryer.online | WhatsApp orders accepted', 24, footerY + 48);

  return canvas;
}

/**
 * Converts canvas to PNG Blob
 */
export function generateRateCardBlob(items, options) {
  return new Promise((resolve) => {
    const canvas = generateRateCardCanvas(items, options);
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Downloads the generated PNG image directly to user device
 */
export function downloadRateCardImage(items, options) {
  const canvas = generateRateCardCanvas(items, options);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  const cat = (options?.categoryTitle || 'rate-list').toLowerCase().replace(/\s+/g, '-');
  a.download = `dr-bhindi-${cat}-prices.png`;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Shares rate card image to WhatsApp using Web Share API on mobile,
 * or copies to clipboard & downloads with WhatsApp Web fallback on desktop.
 */
export async function shareRateCardToWhatsApp(items, options) {
  const blob = await generateRateCardBlob(items, options);
  if (!blob) return { success: false, message: 'Could not generate image' };

  const catName = options?.categoryTitle || 'Daily Fresh';
  const fileName = `dr-bhindi-${catName.toLowerCase().replace(/\s+/g, '-')}-rate-card.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  // 1. Try Native Web Share API with file (works directly in Android Chrome / iOS Safari)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Dr. Bhindi — ${catName} Bhav List`,
        text: `🛒 *Dr. Bhindi — Aaj ki Bhav List*\nOrder online: https://drbhindi.mrfryer.online`,
      });
      return { success: true, method: 'native_share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      // If native share failed, fall through to desktop fallback
      console.warn('Native share failed, using fallback:', err);
    }
  }

  // 2. Desktop fallback: Copy image to clipboard & download image file
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    }
  } catch (clipErr) {
    console.warn('Clipboard write image not supported:', clipErr);
  }

  // Download image file
  downloadRateCardImage(items, options);

  // Open WhatsApp with text
  const shareText = `🛒 *Dr. Bhindi — Aaj ki Bhav List*\nCheck out our latest rates in the image attached!\n📱 Order online: https://drbhindi.mrfryer.online`;
  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');

  return { success: true, method: 'download_fallback' };
}

