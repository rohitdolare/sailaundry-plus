import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

// 🔹 Fetch user data
export const getUserProfile = async (uid) => {
  console.log("getting user");
  
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};

// 🔹 Update user name/mobile
export const updateUserProfile = async (uid, updates) => {
  const docRef = doc(db, "users", uid);
  return updateDoc(docRef, updates);
};

// 🔹 Add new location
export const addLocation = async (uid, newLocation) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();
  const currentLocations = data.locations || [];

  await updateDoc(userRef, {
    locations: [...currentLocations, newLocation],
  });
};

// 🔹 Delete location
export const deleteLocation = async (uid, index) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const locations = snap.data().locations || [];

  locations.splice(index, 1); // Remove one at index
  await updateDoc(userRef, { locations });
};
