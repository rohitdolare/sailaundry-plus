// src/services/firebase/orderService.js
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebase";

const COUNTER_ORDER = "orderNumber";

/** Get next sequential order number (1, 2, 3, ...) via atomic counter. */
async function getNextOrderNumber() {
  const counterRef = doc(db, "counters", COUNTER_ORDER);
  let nextNumber = 1;
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    if (snap.exists()) {
      nextNumber = (snap.data().value ?? 0) + 1;
    }
    transaction.set(counterRef, { value: nextNumber });
  });
  return nextNumber;
}

// 🔹 Add a new order (assigns simple orderNumber: 1, 2, 3, ...)
export const addOrder = async (orderData) => {
  const orderNumber = await getNextOrderNumber();
  const order = {
    ...orderData,
    orderNumber,
    createdAt: serverTimestamp(),
  };
  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, order);
  return docRef.id;
};

// 🔹 Get all orders by user (one-time fetch)
export const getOrdersByUserId = async (uid) => {
  const q = query(collection(db, "orders"), where("uid", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 🔹 Subscribe to user's order updates (live)
export const subscribeToUserOrders = (uid, callback) => {
  const q = query(collection(db, "orders"), where("uid", "==", uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });

  return unsubscribe;
};

// 🔹 Get all orders (admin only)
export const getAllOrders = async () => {
  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 🔹 Subscribe to all orders (admin, live updates)
export const subscribeToAllOrders = (callback) => {
  const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  });
  return unsubscribe;
};

// Shared filter constraints for the admin Orders page: optional status
// equality + optional single-day createdAt range, always ordered newest-first.
function buildOrdersConstraints({ status, dayKey }) {
  const constraints = [];
  if (status && status !== "All") constraints.push(where("status", "==", status));
  if (dayKey) {
    constraints.push(where("createdAt", ">=", new Date(`${dayKey}T00:00:00`)));
    constraints.push(where("createdAt", "<=", new Date(`${dayKey}T23:59:59.999`)));
  }
  constraints.push(orderBy("createdAt", "desc"));
  return constraints;
}

// 🔹 Admin Orders page: one-time fetch of the first bounded page matching
// filters (status/day), instead of reading the whole collection. No live
// listener — the page re-fetches on filter change, pull-to-refresh, or
// "Load more". Firestore requires a composite index for status+createdAt
// combos — the console will print a one-click "create index" link the
// first time this runs if missing.
export const getOrdersFirstPage = async ({ status, dayKey }, pageSize) => {
  const q = query(collection(db, "orders"), ...buildOrdersConstraints({ status, dayKey }), limit(pageSize));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  return {
    data: docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: docs[docs.length - 1] || null,
    hasMore: docs.length === pageSize,
  };
};

// 🔹 Admin Orders page: one-time fetch of the next page after a cursor doc
// ("Load more") — reads only the new page, never re-reads prior pages.
export const getOrdersPageAfter = async ({ status, dayKey }, cursorDoc, pageSize) => {
  const q = query(
    collection(db, "orders"),
    ...buildOrdersConstraints({ status, dayKey }),
    startAfter(cursorDoc),
    limit(pageSize)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  return {
    data: docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: docs[docs.length - 1] || null,
    hasMore: docs.length === pageSize,
  };
};

// 🔹 Get order by ID
export const getOrderById = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// 🔹 Update order (admin only – full edit)
export const updateOrder = async (orderId, orderData) => {
  const orderRef = doc(db, "orders", orderId);
  const { orderNumber, createdAt, ...rest } = orderData;
  await updateDoc(orderRef, rest);
};

// 🔹 Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
};

// 🔹 Delete order (admin only)
export const deleteOrder = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  await deleteDoc(orderRef);
};
