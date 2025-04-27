// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../context//auth/auth_context";
import Loading from "./Loading";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, authUser } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  // Check if we have an authUser (Firebase auth) but still waiting on Firestore data
  if (authUser && !currentUser) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
