import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch products from Firestore.
 * - Filters by category if provided (and not 'all')
 * - Filters by inStock = true
 * - Client-side text search on name/tag
 */
export const fetchProductsFromFirestore = async (category = 'all', search = '') => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);

    let q;
    if (category && category !== 'all') {
      q = query(colRef, where('category', '==', category), where('inStock', '==', true));
    } else {
      q = query(colRef, where('inStock', '==', true));
    }

    const snapshot = await getDocs(q);
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side search filter (avoids extra Firestore reads)
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.tag?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s)
      );
    }

    return products;
  } catch (error) {
    console.error('[Firestore] fetchProducts error:', error);
    return null;
  }
};
