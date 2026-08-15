import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import loginIllustration from "../assets/login-illustration.jpg";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      console.error("Password reset failed:", err);
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/user-not-found") {
        // Avoid confirming/denying account existence
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300 bg-opacity-30 blur-3xl dark:bg-opacity-20" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-indigo-300 bg-opacity-30 blur-3xl dark:bg-opacity-20" />
      </div>

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">

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

          <div className="w-full max-w-md mx-auto animate-slide-up">
            <div className="bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 backdrop-blur-xl backdrop-filter shadow-xl rounded-3xl p-8 space-y-8">
              {sent ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <MailCheck className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                    Check your email
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If an account exists for <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>, a password reset link is on its way. Check spam/junk if it doesn't show up soon.
                  </p>
                  <Link
                    to="/login"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg transition duration-200 hover:-translate-y-px hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                      Reset your password
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Enter your account email and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-950 dark:bg-opacity-30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm animate-shake">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white font-semibold rounded-2xl shadow-lg transition duration-200 hover:-translate-y-px hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <Link
                    to="/login"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
