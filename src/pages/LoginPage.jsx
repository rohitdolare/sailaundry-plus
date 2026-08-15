import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import loginIllustration from "../assets/login-illustration.jpg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // If already logged in, redirect by role
  useEffect(() => {
    if (!user) return;
    navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();

        const role = profileData.role || "customer";
        const verified = profileData.verified === true;

        // Only verified customers can login; admins can always login
        if (role === "customer" && !verified) {
          await signOut(auth);
          setError("Your account is pending verification. Please contact admin.");
          setLoading(false);
          return;
        }

        // Build consistent user object (role: "customer" | "admin")
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const finalUser = {
          uid: user.uid,
          name: profileData.name,
          mobile: profileData.mobile,
          email: profileData.email,
          role,
          createdAt: profileData.createdAt,
          expiresAt,
        };

        // Set in auth context
        login(finalUser);
        // Redirect by role: admin → /admin, customer → /
        navigate(role === "admin" ? "/admin" : "/");
      } else {
        setError("User profile not found. Please complete signup.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed. Please try again.");
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left: Illustration & minimal branding */}
          <div className="text-center md:text-left space-y-6 animate-fade-in">
            <div className="flex justify-center md:justify-start">
              <img
                src={loginIllustration}
                alt="Laundry made easy"
                className="w-full max-w-sm md:max-w-md object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                Sai Laundry+
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Smart laundry, at your doorstep.</p>
            </div>
          </div>

          {/* Right: Login Form Card */}
          <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 backdrop-blur-xl backdrop-filter shadow-xl rounded-3xl p-8 space-y-8">
              <div className="text-center">
                <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950 dark:bg-opacity-30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-2xl focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-transparent rounded-2xl focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-indigo-600 dark:accent-indigo-400" />
                    <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                    Forgot?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white font-semibold rounded-2xl shadow-lg transition duration-200 hover:-translate-y-px hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">New to Sai Laundry+?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                to="/signup"
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 font-semibold rounded-2xl transition duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>

            {/* Footer Text */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
              By signing in, you agree to our{" "}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
