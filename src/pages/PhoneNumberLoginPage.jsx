import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const PhoneNumberLoginPage = () => {
  const [phone, setPhone] = useState("+91");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Setup invisible reCAPTCHA only once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container", // DOM ID
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expired");
          },
        },
        auth
      );

      // Force render immediately
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmationResult;

      alert("OTP sent successfully ✅");
      navigate("/verify-otp");
    } catch (error) {
      console.error("OTP send error:", error);
      alert("Failed to send OTP: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSendOTP}
        className="max-w-sm w-full p-6 bg-white rounded-xl shadow-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login with Phone</h2>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91XXXXXXXXXX"
          required
          className="w-full px-3 py-2 mb-4 border rounded-md"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {/* ✅ Important: This div must exist */}
        <div id="recaptcha-container"></div>
      </form>
    </div>
  );
};

export default PhoneNumberLoginPage;
