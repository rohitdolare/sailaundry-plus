// src/components/Navbar.jsx

import { Link } from "react-router-dom";

/**
 * Top navigation bar for the application.
 * Add links to all main sections.
 */
export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between">
      <h1 className="font-bold text-xl">SaiLaundry+</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/orders" className="hover:underline">Orders</Link>
        <Link to="/settings" className="hover:underline">Settings</Link>
      </div>
    </nav>
  );
}
