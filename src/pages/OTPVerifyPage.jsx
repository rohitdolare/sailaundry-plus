// src/pages/OTPVerifyPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const OTPVerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const confirmationResult = window.confirmationResult;

      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Optional: Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user record (basic only for now)
        await setDoc(userDocRef, {
          uid: user.uid,
          phone: user.phoneNumber,
          createdAt: new Date(),
        });
      }

      alert("Login successful 🎉");
      navigate("/");

    } catch (error) {
      console.error("OTP verification failed:", error);
      alert("Invalid OTP or expired. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleVerifyOTP}
        className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Verify OTP
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          className="w-full px-4 py-2 rounded border dark:border-gray-600 bg-transparent text-gray-800 dark:text-white outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default OTPVerifyPage;
