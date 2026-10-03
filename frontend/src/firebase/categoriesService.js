/**
 * categoriesService.js
 * Reads and writes the `inventory/categories` Firestore document.
 *
 * Document shape:
 * {
 *   list: [
 *     { id: 'vegetables', label: 'Vegetables', icon: '🥬', order: 0 },
 *     ...
 *   ],
 *   updatedAt: Timestamp,
 * }
 */
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const CATEGORIES_DOC = doc(db, 'inventory', 'categories');

// ── Default categories (seeded on first run) ───────────────────────────────────
export const DEFAULT_CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', icon: '🥬', order: 0 },
  { id: 'fruits',     label: 'Fruits',     icon: '🍎', order: 1 },
  { id: 'exotic',     label: 'Exotics',    icon: '🥑', order: 2 },
  { id: 'combos',     label: 'Combos',     icon: '🥗', order: 3 },
  { id: 'seasonal',   label: 'Seasonal',   icon: '🍌', order: 4 },
  { id: 'sprouts',    label: 'Sprouts',    icon: '🌿', order: 5 },
];

// ── Seed Firestore if the categories doc doesn't exist ────────────────────────
export const seedCategoriesIfEmpty = async () => {
  try {
    const snap = await getDoc(CATEGORIES_DOC);
    if (!snap.exists()) {
      await setDoc(CATEGORIES_DOC, {
        list: DEFAULT_CATEGORIES,
        updatedAt: serverTimestamp(),
      });
      console.log('[Categories] Seeded default categories to Firestore.');
    }
  } catch (err) {
    console.error('[Categories] seedCategoriesIfEmpty error:', err);
  }
};

// ── Real-time listener ─────────────────────────────────────────────────────────
/**
 * Subscribe to real-time updates on the inventory/categories document.
 * Calls `onCategories(categoriesArray)` whenever data changes.
 * Returns the unsubscribe function.
 */
export const subscribeToCategories = (onCategories) => {
  return onSnapshot(CATEGORIES_DOC, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const sorted = [...(data.list || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      onCategories(sorted);
    } else {
      onCategories(DEFAULT_CATEGORIES);
    }
  }, (err) => {
    console.error('[Categories] listener error:', err);
    onCategories(DEFAULT_CATEGORIES);
  });
};

// ── Admin write: save entire categories list ───────────────────────────────────
export const saveCategoriesToFirestore = async (categoriesList) => {
  // Re-assign order based on array position
  const withOrder = categoriesList.map((c, i) => ({ ...c, order: i }));
  await setDoc(CATEGORIES_DOC, {
    list: withOrder,
    updatedAt: serverTimestamp(),
  });
};
