import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Protects routes so that only authenticated users can access them
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While auth state is loading, render nothing
  if (loading) {
    return null;
  }
 // If no user is logged in, redirect to sign-in page
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }
// If user is authenticated, render the protected children components
  return children;
}