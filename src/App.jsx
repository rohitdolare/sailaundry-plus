import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import SettingPage from "./pages/SettingPage";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ContactPage from "./pages/ContactPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";

function App() {

  return (
   <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
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
      </Route>
    </Routes>
  );
}

export default App;
