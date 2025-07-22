// src/services/firebase/orderService.js
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

// 🔹 Add a new order
export const addOrder = async (orderData) => {
  const order = {
    ...orderData,
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
