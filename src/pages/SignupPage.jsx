import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import signupIllustration from "../assets/login-illustration.png";

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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200 to-purple-200 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full opacity-30 animate-pulse delay-700" />
      </div>

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Illustration & minimal branding */}
          <div className="text-center md:text-left space-y-6 animate-fade-in">
            <div className="flex justify-center md:justify-start">
              <img
                src={signupIllustration}
                alt="Laundry made easy"
                className="w-full max-w-sm md:max-w-md object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Join Sai Laundry+
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">One signup. Laundry sorted.</p>
            </div>
          </div>

          {/* Right: Signup form card */}
          <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white dark:border-gray-800 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h2>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 border-transparent rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <input
                  type="tel"
                  placeholder="Mobile (10 digits)"
                  value={mobile}
                  required
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 border-transparent rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 border-transparent rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2 border-transparent rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition duration-200 hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing up...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
