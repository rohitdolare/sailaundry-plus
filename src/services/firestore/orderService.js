// src/services/firebase/orderService.js
import { addDoc, collection, serverTimestamp,query, where, getDocs } from "firebase/firestore";
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

export const getOrdersByUserId = async (uid) => {
    const q = query(
    collection(db, "orders"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  const orders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return orders;
};


