// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🧪 Simulated mock user for demo purposes
  const mockUser = {
    mobile: "8888888888",
    password: "user123",
    name: "Regular User",
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (mobile === mockUser.mobile && password === mockUser.password) {
      const { password, ...safeUser } = mockUser; // Remove password
      login(safeUser);
      navigate("/");
    } else {
      setError("Invalid mobile or password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-2xl"
      >
        <h2 className="text-center text-3xl font-bold text-blue-700">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-500">
          Please login to continue
        </p>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700"
          >
            Mobile Number
          </label>
          <input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="focus:outline-none mt-1 w-full rounded-md border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 10-digit mobile number"
            required
            pattern="\d{10}"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus:outline-none mt-1 w-full rounded-md border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 text-white transition duration-200 hover:bg-blue-700"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-500">© 2025 SaiLaundry+</p>
      </form>
    </div>
  );
};

export default LoginPage;
