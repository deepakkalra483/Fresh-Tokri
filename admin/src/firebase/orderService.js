import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';

const ORDERS_COLLECTION = 'orders';

/**
 * Fetch all orders from Firestore, ordered by createdAt descending.
 * Returns an array of order objects (each with an `id` field), or null on error.
 */
export const fetchAllOrdersFromFirestore = async () => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.warn('[orderService] fetchAllOrdersFromFirestore error:', err.message);
    return null;
  }
};

/**
 * Update the status field of an order document in Firestore.
 * Returns null on error.
 */
export const updateOrderStatusInFirestore = async (id, status) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.warn('[orderService] updateOrderStatusInFirestore error:', err.message);
    return null;
  }
};

/**
 * Assign a rider to an order and set status to 'on_way'.
 * Returns null on error.
 */
export const assignRiderInFirestore = async (id, rider) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, { rider, status: 'on_way' });
  } catch (err) {
    console.warn('[orderService] assignRiderInFirestore error:', err.message);
    return null;
  }
};
