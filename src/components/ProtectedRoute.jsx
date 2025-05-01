import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth/auth_context";
import Loading from "./Loading";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, authLoading, userDataLoading } = useAuth();
  const location = useLocation();

  // Show loading while either Firebase auth or Firestore user data is loading
  if (loading || authLoading || userDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Only redirect when we're certain the user is not authenticated
  // (not when we're still loading auth or user data)
  if (!loading && !authLoading && !userDataLoading && !currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
