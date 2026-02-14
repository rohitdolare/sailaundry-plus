import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import SettingPage from "./pages/SettingPage";
import ContactPage from "./pages/ContactPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminPlaceOrderPage from "./pages/admin/AdminPlaceOrderPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
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

        {/* 🔒 Admin Routes (role === "admin" only) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="create-order" element={<AdminPlaceOrderPage />} />
          <Route path="create-order/:orderId" element={<AdminPlaceOrderPage />} />
          <Route path="catalog" element={<AdminCatalogPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
        </Route>

        {/* 🔒 Protected Routes (customers) */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
