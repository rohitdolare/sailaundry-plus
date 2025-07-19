import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, logout, loading } = useAuth();

  if (loading) {
  return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
}


  try {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      const expiresAt = new Date(parsed.expiresAt);

      if (new Date() > expiresAt) {
        logout();
        return <Navigate to="/login" replace />;
      }
    }
  } catch (err) {
    logout();
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

