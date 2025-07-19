// src/pages/ProfileSetupPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const ProfileSetupPage = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        phone: user.phoneNumber,
        name: form.name,
        email: form.email || "",
        location: form.location || "",
        createdAt: new Date(),
      });

      alert("Profile saved successfully 🎉");
      navigate("/");

    } catch (error) {
      console.error("Profile setup error:", error.message);
      alert("Failed to save profile: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Complete Your Profile
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded border dark:border-gray-600 bg-transparent text-gray-800 dark:text-white outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded border dark:border-gray-600 bg-transparent text-gray-800 dark:text-white outline-none"
        />

        <input
          type="text"
          name="location"
          placeholder="Location (optional)"
          value={form.location}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded border dark:border-gray-600 bg-transparent text-gray-800 dark:text-white outline-none"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
