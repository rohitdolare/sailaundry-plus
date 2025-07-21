// src/services/firebase/orderService.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

// 🔹 Add a new order
export const addOrder = async (orderData) => {
  const order = {
    ...orderData,
    createdAt: serverTimestamp(), // store server timestamp
  };

  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, order);
  return docRef.id;
};
