/**
 * inventoryService.js
 * Reads and writes the single `inventory/menu` Firestore document.
 *
 * Document shape:
 * {
 *   menu: {
 *     vegetables: [ { id, name, weight, priceInstant, priceMorning, oldPrice, image, emoji, tag, discount, description, origin, inStock }, ... ],
 *     fruits:     [ ... ],
 *     exotic:     [ ... ],
 *     combos:     [ ... ],
 *     seasonal:   [ ... ],
 *     sprouts:    [ ... ],
 *   },
 *   updatedAt: Timestamp,
 * }
 *
 * All products are flattened from `menu.*` arrays when consumed by the UI.
 */
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const INVENTORY_DOC = doc(db, 'inventory', 'menu');

// ── Default seed data (written to Firestore on first run if doc is empty) ────
export const DEFAULT_MENU = {
  vegetables: [
    { id: 'p1', name: 'Super Fresh Organic Tomatoes', weight: '1 kg', priceInstant: 55, priceMorning: 38, oldPrice: 65, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', emoji: '🍅', tag: 'Farm Fresh', discount: '20% OFF', origin: 'Sourced 4 AM from Malwa Organic Farms', description: 'Hand-picked ruby red tomatoes. Grown naturally without synthetic pesticides.', inStock: true },
    { id: 'p3', name: 'Baby Leaf Spinach (Palak)', weight: '250 g', priceInstant: 25, priceMorning: 18, oldPrice: 32, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', emoji: '🥬', tag: 'Direct Pick', discount: '28% OFF', origin: 'Local Hydroponic Greenhouse', description: 'Triple-washed tender spinach leaves.', inStock: true },
    { id: 'p5', name: 'Crispy Green Cucumbers', weight: '500 g', priceInstant: 30, priceMorning: 22, oldPrice: 38, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80', emoji: '🥒', tag: 'Cooling', discount: '26% OFF', origin: 'Polyhouse Fresh Harvest', description: 'Thin-skinned hydrative cucumbers.', inStock: true },
    { id: 'p7', name: 'Farm Green Peas', weight: '500 g', priceInstant: 45, priceMorning: 32, oldPrice: 58, image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&q=80', emoji: '🫛', tag: 'Seasonal', discount: '22% OFF', origin: 'Himachal Pradesh Farms', description: 'Sweet tender green peas, hand-shelled.', inStock: true },
  ],
  fruits: [
    { id: 'p2', name: 'Shimla Red Royal Apples', weight: '500 g', priceInstant: 90, priceMorning: 70, oldPrice: 110, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', emoji: '🍎', tag: 'Crispy', discount: '22% OFF', origin: 'Direct Orchard Sourced from Kinnaur, HP', description: 'Sweet juicy crunchy red apples. Rich in fiber and antioxidants.', inStock: true },
    { id: 'p4', name: 'Robusta Ripe Bananas', weight: '1 Dozen', priceInstant: 60, priceMorning: 48, oldPrice: 75, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', emoji: '🍌', tag: 'Potassium', discount: '20% OFF', origin: 'Kerala Certified Farmers Co-op', description: 'Naturally ripened nutrient-dense bananas.', inStock: true },
    { id: 'p8', name: 'Sweet Seedless Grapes', weight: '500 g', priceInstant: 80, priceMorning: 62, oldPrice: 95, image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80', emoji: '🍇', tag: 'Seedless', discount: '18% OFF', origin: 'Nashik Vineyards, Maharashtra', description: 'Plump juicy seedless grapes, rich in antioxidants.', inStock: true },
  ],
  exotic: [
    { id: 'p9', name: 'Hass Avocado', weight: '2 pcs', priceInstant: 120, priceMorning: 95, oldPrice: 150, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', emoji: '🥑', tag: 'Keto', discount: '20% OFF', origin: 'Tamil Nadu Exotic Farms', description: 'Buttery creamy avocados, perfect for salads and toast.', inStock: true },
    { id: 'p10', name: 'Baby Bok Choy', weight: '300 g', priceInstant: 75, priceMorning: 58, oldPrice: 90, image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72c4?w=400&q=80', emoji: '🥦', tag: 'Asian', discount: '17% OFF', origin: 'Ooty High Altitude Farms', description: 'Crisp Chinese cabbage, great for stir-fry.', inStock: true },
  ],
  combos: [
    { id: 'p11', name: 'Weekly Veggie Combo Box', weight: '3 kg Assorted', priceInstant: 199, priceMorning: 159, oldPrice: 250, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80', emoji: '🥗', tag: 'Best Value', discount: '20% OFF', origin: 'Mixed Local & Organic Sources', description: 'Curated weekly box of 5-6 seasonal veggies — best value!', inStock: true },
  ],
  seasonal: [
    { id: 'p12', name: 'Raw Mango (Keri)', weight: '500 g', priceInstant: 65, priceMorning: 50, oldPrice: 80, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', emoji: '🥭', tag: 'Seasonal', discount: '19% OFF', origin: 'Ratnagiri, Maharashtra', description: 'Tangy raw mangoes — perfect for pickles, chutneys, and drinks.', inStock: true },
  ],
  sprouts: [
    { id: 'p13', name: 'Mixed Sprouts & Microgreens', weight: '150 g', priceInstant: 35, priceMorning: 28, oldPrice: 42, image: 'https://images.unsplash.com/photo-1555183606-28a87e6cd7b9?w=400&q=80', emoji: '🌿', tag: 'Superfood', discount: '17% OFF', origin: 'In-house Hydroponic Unit', description: 'Nutrient-dense mixed sprouts — moong, lentil, fenugreek, and radish microgreens.', inStock: true },
  ],
};

// ── Flatten menu object → flat products array ─────────────────────────────────
export const flattenMenu = (menuObj) => {
  if (!menuObj) return [];
  return Object.entries(menuObj).flatMap(([category, items]) =>
    (items || []).map(item => ({ ...item, category }))
  );
};

// ── Seed Firestore if the doc doesn't exist ───────────────────────────────────
export const seedInventoryIfEmpty = async () => {
  try {
    const snap = await getDoc(INVENTORY_DOC);
    if (!snap.exists()) {
      await setDoc(INVENTORY_DOC, { menu: DEFAULT_MENU, updatedAt: serverTimestamp() });
      console.log('[Inventory] Seeded default menu to Firestore.');
    }
  } catch (err) {
    console.error('[Inventory] seedInventoryIfEmpty error:', err);
  }
};

// ── Real-time listener ────────────────────────────────────────────────────────
/**
 * Subscribe to real-time updates on the inventory/menu document.
 * Calls `onProducts(flatArray)` whenever Firestore data changes.
 * Returns the unsubscribe function.
 */
export const subscribeToInventory = (onProducts) => {
  return onSnapshot(INVENTORY_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onProducts(flattenMenu(data.menu));
    } else {
      onProducts([]);
    }
  }, (err) => {
    console.error('[Inventory] listener error:', err);
    onProducts([]);
  });
};

// ── Admin write: save entire menu back to Firestore ───────────────────────────
/**
 * Save the entire products array to Firestore.
 * Re-groups flat product array back into category buckets.
 */
export const saveInventoryToFirestore = async (flatProducts) => {
  // Re-group by category
  const menuObj = {};
  for (const p of flatProducts) {
    const cat = p.category || 'vegetables';
    if (!menuObj[cat]) menuObj[cat] = [];
    // Strip the `category` field from the stored item (it's implicit from the key)
    const { category, ...item } = p;
    menuObj[cat].push(item);
  }
  await setDoc(INVENTORY_DOC, { menu: menuObj, updatedAt: serverTimestamp() });
};
