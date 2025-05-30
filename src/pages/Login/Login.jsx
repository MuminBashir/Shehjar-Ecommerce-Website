import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth/auth_context";
import googleLogo from "../../assets/googlelogo.webp";
import shehjarlogo from "../../assets/shehjarlogo.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const {
    signInWithGoogle,
    fromCart,
    setFromCart,
    currentUser,
    userDataLoading,
    loading: authLoading,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from =
    location.state?.from === "/login" ? "/" : location.state?.from || "/";

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithGoogle();

      // Check if the user came from cart and redirect accordingly
      if (fromCart) {
        navigate("/cart");
        setFromCart(false);
      } else {
        if (typeof from === "string") {
          navigate(from, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !userDataLoading && !authLoading && !fromCart) {
      // Redirect to profile if user is already logged in
      navigate(from, { replace: true });
    }
  }, [currentUser, userDataLoading, authLoading]);

  return (
    <div className="flex h-screen">
      {/* Left side - Image and text */}
      <div className="hidden flex-col justify-center bg-gradient-to-br from-primary to-primary p-12 md:flex md:w-1/2">
        <h1 className="mb-4 font-serif text-2xl font-bold text-white">
          S H E H J A R.
        </h1>
        <p className="mb-8 text-white">
          We weave dignity into every thread, carve pride into every motif, and
          connect you with the soul of Kashmir — one handcrafted piece at a
          time.
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full items-center justify-center p-8 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex items-center justify-center">
                <img src={shehjarlogo} alt="Shehjar" width={200} height={200} />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Welcome To Shehjar</h2>
            {fromCart && (
              <p className="mt-2 text-sm text-gray-600">
                Please sign in to continue to checkout
              </p>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-3 px-4 font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-100 ${
                loading ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {loading ? (
                <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></span>
              ) : (
                <img src={googleLogo} alt="Google" className="h-5 w-5" />
              )}
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            By signing in, you agree to our{" "}
            <a
              href="/terms-and-conditions"
              className="text-primary hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
