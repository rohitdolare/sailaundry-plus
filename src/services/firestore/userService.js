// src/services/firebase/userService.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
