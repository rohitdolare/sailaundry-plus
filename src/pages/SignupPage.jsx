import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { toast } from "react-hot-toast";
import SaiLaundryLogo from "../components/SaiLaundryLogo";
import { useAuth } from "../contexts/AuthContext";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAuth();

  const validate = () => {
  // Basic full name validation
  if (fullName.trim().length < 3) {
    toast.error("Full name must be at least 3 characters long.");
    return false;
  }

  // Mobile number validation (10 digits, numeric only)
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    toast.error("Enter a valid 10-digit mobile number.");
    return false;
  }

  // Email validation (basic regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast.error("Enter a valid email address.");
    return false;
  }

  // Password validation (minimum 6 characters)
  if (password.length < 6) {
    toast.error("Password must be at least 6 characters.");
    return false;
  }

  return true; // ✅ all good
};


  const handleSignup = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);

  try {
    // 1. Create user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // 2. Save user profile in Firestore (new users are customers, unverified until admin verifies)
    const userData = {
      name: fullName,
      mobile,
      email,
      role: "customer",
      verified: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), userData);

    // 3. Don't auto-login: only verified customers can login
    toast.success("Account created. You can sign in once admin verifies your account.");
    navigate("/login");

  } catch (error) {
    console.error("Signup failed:", error);
    toast.error("Signup failed: " + error.message);
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#ffe3ec] via-[#d2f2ff] to-[#f5e0ff] px-4 py-10">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left side: Branding/info */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-pink-700">Join Sai Laundry+</h1>
          <p className="text-lg text-gray-700">
            Create your account to manage laundry orders, schedule pickups, and enjoy a seamless experience.
          </p>
          <p className="text-base text-gray-600">
            One-time signup. Lifetime convenience.
          </p>
          <SaiLaundryLogo/>
        </div>

        {/* Right side: Signup form */}
        <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-pink-800">Create Your Account</h2>

          <form onSubmit={handleSignup} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              required
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 placeholder-gray-600 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              required
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 placeholder-gray-600 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 placeholder-gray-600 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 placeholder-gray-600 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg shadow transition"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-700">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-pink-700 font-semibold underline hover:text-pink-900"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
