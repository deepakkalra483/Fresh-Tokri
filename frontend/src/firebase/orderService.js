/**
 * orderService.js
 * Firestore CRUD + real-time listeners for the `orders` collection.
 *
 * Order document shape:
 * {
 *   orderId, userId, customerName, phone,
 *   items: [{ id, name, qty, price }],
 *   totalPaid, paymentMethod, deliveryAddress,
 *   mode: 'instant'|'morning',
 *   status: 'placed'|'packed'|'on_way'|'delivered',
 *   eta, rider: { name, phone, rating, avatar } | null,
 *   placedAt, createdAt (serverTimestamp)
 * }
 */
import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, query, orderBy, where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const ORDERS_COL = 'orders';

// ── Place a new order ─────────────────────────────────────────────────────────
export const createOrderInFirestore = async (orderPayload) => {
  try {
    const orderId = `FT-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderData = {
      orderId,
      userId:          orderPayload.userId || 'guest',
      customerName:    orderPayload.customerName || 'Customer',
      phone:           orderPayload.phone || '',
      items:           orderPayload.items || [],
      totalPaid:       orderPayload.total || 0,
      paymentMethod:   orderPayload.paymentMethod || 'UPI',
      deliveryAddress: orderPayload.deliveryAddress || '',
      mode:            orderPayload.mode || 'instant',
      status:          'placed',
      eta:             orderPayload.mode === 'instant' ? '15-20 Mins' : 'Tomorrow 6:00 AM–9:00 AM',
      rider:           null,
      placedAt:        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt:       serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, ORDERS_COL), orderData);
    return { id: docRef.id, ...orderData };
  } catch (err) {
    console.error('[Orders] createOrder error:', err);
    return null;
  }
};

// ── Update order status (admin) ───────────────────────────────────────────────
export const updateOrderStatusInFirestore = async (docId, newStatus, riderData = null) => {
  try {
    const updateData = { status: newStatus };
    if (riderData) updateData.rider = riderData;
    await updateDoc(doc(db, ORDERS_COL, docId), updateData);
  } catch (err) {
    console.error('[Orders] updateStatus error:', err);
  }
};

// ── Real-time listener: ALL orders (admin) ────────────────────────────────────
/**
 * Subscribes to all orders ordered by createdAt desc.
 * Calls `onOrders(ordersArray)` on every Firestore update.
 * Returns unsubscribe function.
 */
export const subscribeToAllOrders = (onOrders) => {
  const q = query(
    collection(db, ORDERS_COL),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onOrders(orders);
  }, (err) => {
    console.error('[Orders] all-orders listener error:', err);
    onOrders([]);
  });
};

// ── Real-time listener: orders for a specific user (customer) ─────────────────
/**
 * Subscribes to orders where userId == uid.
 * NOTE: We deliberately avoid orderBy here to prevent requiring a composite
 * Firestore index. Sorting is done client-side instead.
 * Returns unsubscribe function.
 */
export const subscribeToUserOrders = (uid, onOrders) => {
  // Simple single-field query — no composite index needed
  const q = query(
    collection(db, ORDERS_COL),
    where('userId', '==', uid)
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      // Sort client-side: newest first
      .sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
    onOrders(orders);
  }, (err) => {
    console.error('[Orders] user-orders listener error:', err);
    // Don't wipe orders on error — just log so existing data stays visible
  });
};
