// src/services/firebase/userService.js
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

// 🔹 Fetch user profile data
export const getUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};

// 🔹 Update user profile (name, mobile, etc.)
export const updateUserProfile = async (uid, updates) => {
  const docRef = doc(db, "users", uid);
  return updateDoc(docRef, updates);
};

// 🔹 Fetch user locations only
export const getUserLocations = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data().locations || [] : [];
};

// 🔹 Add a new location
export const addLocation = async (uid, newLocation) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const currentLocations = userSnap.data().locations || [];

  await updateDoc(userRef, {
    locations: [...currentLocations, newLocation],
  });
};

// 🔹 Delete a location by index
export const deleteLocation = async (uid, index) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const locations = snap.data().locations || [];

  locations.splice(index, 1);
  await updateDoc(userRef, { locations });
};

// 🔹 Get only customer accounts (role !== "admin")
export const getAllCustomers = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "users"), where("role", "!=", "admin"))
    );
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching customers (check Firestore rules):", error);
    return [];
  }
};

// 🔹 Subscribe to customer accounts (role !== "admin"), live updates
export const subscribeToAllCustomers = (callback) => {
  const q = query(collection(db, "users"), where("role", "!=", "admin"));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })));
    },
    (error) => {
      console.error("Error in customers listener (check Firestore rules):", error);
    }
  );
  return unsubscribe;
};

// 🔹 Get only admin accounts
export const getAllAdmins = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "admin"))
    );
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching admins (check Firestore rules):", error);
    return [];
  }
};

// 🔹 Admin: set customer verified (only verified customers can login)
export const updateUserVerified = async (uid, verified) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { verified: !!verified });
};

// 🔹 Admin: delete customer (removes user document; does not delete Firebase Auth user if any)
export const deleteUserProfile = async (uid) => {
  const docRef = doc(db, "users", uid);
  await deleteDoc(docRef);
};

// 🔹 Create walk-in customer (no Auth - name + mobile only)
export const createWalkinUser = async ({ name, mobile, address }) => {
  const userData = {
    name: (name || "").trim(),
    mobile: (mobile || "").trim(),
    role: "customer",
    isWalkIn: true,
    locations: address?.trim()
      ? [{ label: "Default", address: address.trim() }]
      : [],
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "users"), userData);
  return docRef.id;
};
