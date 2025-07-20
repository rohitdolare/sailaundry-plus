import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import SaiLaundryLogo from "../components/SaiLaundryLogo";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const profileData = docSnap.data();

      // ✅ Build consistent user object
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const finalUser = {
        uid: user.uid,
        name: profileData.name,
        mobile: profileData.mobile,
        email: profileData.email,
        createdAt: profileData.createdAt,
        expiresAt,
      };

      // ✅ Set in auth context
      login(finalUser);
      navigate("/");
    } else {
      alert("User profile not found. Please complete signup.");
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed: " + error.message);
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#c2f0f7] via-[#e8d4ff] to-[#fef6ff] px-4 py-10">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* 👉 Left: Branding / Info */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800">Welcome to Sai Laundry+</h1>
          <p className="text-lg text-gray-700">
            Your clothes, our care. Track orders, schedule pickups, and manage your laundry seamlessly — all in one place.
          </p>
          <p className="text-base text-gray-600">
            Trusted by 1000+ customers. Fast. Reliable. Affordable.
          </p>
          <SaiLaundryLogo/>
        </div>

        {/* 👉 Right: Login Card */}
        <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-indigo-900">Login to Your Account</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 placeholder-gray-600 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 placeholder-gray-600 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-700">
            New to SaiLaundry+?{" "}
            <Link
              to="/signup"
              className="text-indigo-700 font-semibold underline hover:text-indigo-900"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
