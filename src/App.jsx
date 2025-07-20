import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// Pages
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import SettingPage from "./pages/SettingPage";
import ContactPage from "./pages/ContactPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import CatalogPage from "./pages/CatalogPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <>
      <Toaster position="bottom-center" />

      <Routes>
        {/* 🔓 Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

       
        {/* 🔒 Protected Routes with Profile Check */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="place-order" element={<PlaceOrderPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
