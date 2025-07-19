import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        mobile,
        email,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#ffe3ec] via-[#d2f2ff] to-[#f5e0ff] px-4 py-10">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left side: Branding/info */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-pink-700">Join SaiLaundry+</h1>
          <p className="text-lg text-gray-700">
            Create your account to manage laundry orders, schedule pickups, and enjoy a seamless experience.
          </p>
          <p className="text-base text-gray-600">
            One-time signup. Lifetime convenience.
          </p>
          <img
            src="/logo.svg"
            alt="SaiLaundry+ Logo"
            className="w-40 h-auto mt-6 mx-auto md:mx-0"
          />
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
