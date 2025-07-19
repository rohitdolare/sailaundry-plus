import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
// 🔴 Comment this if you're not using Firestore anymore
// import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth /* , db */ } from "../firebase";

const CheckUserProfile = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔍 Auth state changed:", user);

      if (user) {
        // ✅ If you're not using Firestore profile checks anymore, skip this:
        /*
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          console.log("✅ User profile exists in Firestore");
          setAllowed(true);
        } else {
          console.warn("⚠️ No user profile found. Redirecting to /profile-setup");
          navigate("/profile-setup");
        }
        */

        // 👉 Directly allow access
        setAllowed(true);
      } else {
        console.warn("⛔ No user signed in. Redirecting to login");
        navigate("/login");
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (checking) return <div>Checking auth...</div>;

  return allowed ? children : null;
};

export default CheckUserProfile;
