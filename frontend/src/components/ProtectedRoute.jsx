import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// adminOnly=true restricts access to admin users only
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
