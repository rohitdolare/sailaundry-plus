import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import signupIllustration from "../assets/login-illustration-2.jpg";

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

  return true;
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
    toast.success("Account created. You can sign in once your account is verified.");
    navigate("/login");

  } catch (error) {
    console.error("Signup failed:", error);
    toast.error("Signup failed: " + error.message);
  }

  setLoading(false);
};

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Decorative background mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300 bg-opacity-30 blur-3xl dark:bg-opacity-20" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-indigo-300 bg-opacity-30 blur-3xl dark:bg-opacity-20" />
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
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                Join Sai Laundry+
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">One signup. Laundry sorted.</p>
            </div>
          </div>

          {/* Right: Signup form card */}
          <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 backdrop-blur-xl backdrop-filter shadow-xl rounded-3xl p-8 space-y-6">
              <div className="text-center">
                <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Create account</h2>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  required
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-2xl focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <input
                  type="tel"
                  placeholder="Mobile (10 digits)"
                  value={mobile}
                  required
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-2xl focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-2xl focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-2xl focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white font-semibold rounded-2xl shadow-lg transition duration-200 hover:-translate-y-px hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin" />
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
