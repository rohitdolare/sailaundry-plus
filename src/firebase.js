// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5O0Sa8-FQ1h7NUu-Nw4JlkUefTdV7KPI",
  authDomain: "sailaundry-plus.firebaseapp.com",
  projectId: "sailaundry-plus",
  storageBucket: "sailaundry-plus.appspot.com",
  messagingSenderId: "404750163852",
  appId: "1:404750163852:web:8e1ccf39888c31c180c0a9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
