// src/services/firebase/orderService.js
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
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

// 🔹 Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
};
