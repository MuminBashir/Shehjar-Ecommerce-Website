import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { auth, db } from "../../firebase/config";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Firebase auth loading
  const [userDataLoading, setUserDataLoading] = useState(false); // Firestore user data loading
  const [fromCart, setFromCart] = useState(false);
  const [cartMerged, setCartMerged] = useState(false);

  // Use the useDocument hook to get real-time updates
  const [userDoc, userDocLoading, userDocError] = useDocument(
    authUser ? doc(db, "users", authUser.uid) : null
  );

  // Derived state for currentUser using userDoc data
  const currentUser = useMemo(() => {
    return userDoc?.exists() ? userDoc.data() : null;
  }, [userDoc]);

  // Combined loading state - true when either auth or user data is loading
  const loading = authLoading || (authUser && userDataLoading);

  // Handle merging localStorage cart to user's cart in Firebase
  const mergeLocalCartToUser = async (userId) => {
    // Prevent multiple merges
    if (cartMerged || !fromCart) return;

    try {
      // Get local cart
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (localCart.length === 0) {
        setCartMerged(true);
        return; // No items to merge
      }

      // Get user's current cart
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userCart = userData.cart || [];

        // Merge the carts - add local items to user's cart
        const mergedCart = [...userCart];

        localCart.forEach((localItem) => {
          const existingItemIndex = mergedCart.findIndex(
            (item) =>
              item.product_id === localItem.product_id &&
              item.size === localItem.size &&
              item.color === localItem.color
          );

          if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            mergedCart[existingItemIndex].quantity += localItem.quantity;
          } else {
            // Add new item
            mergedCart.push(localItem);
          }
        });

        // Update user's cart in Firebase
        await updateDoc(userRef, { cart: mergedCart });

        // Clear local cart after successful merge
        localStorage.setItem("cart", JSON.stringify([]));
        toast.success("Your cart has been updated with your saved items!");
      }
    } catch (error) {
      console.error("Error merging cart:", error);
      toast.error("Failed to save your cart items");
    } finally {
      // Mark as merged to prevent duplicate merges
      setCartMerged(true);
      setFromCart(false);
    }
  };

  // Handle Google Sign In
  const signInWithGoogle = async (redirectPath = "/") => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // If user doesn't exist, create new user document
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          cart: [], // Initialize empty cart
        });
        toast.success("Welcome to our store!");
      } else {
        toast.success("Welcome back!");
      }

      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error(`Sign in failed: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.info("You've been signed out");
      // Reset cart merging flags on logout
      setCartMerged(false);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(`Sign out failed: ${error.message}`);
      return false;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);

      if (user) {
        // When we get a user, we're now waiting for Firestore data
        setUserDataLoading(true);
      } else {
        // When no user, we're done with auth loading
        setAuthLoading(false);
        setUserDataLoading(false);
        setCartMerged(false); // Reset when user logs out
      }
    });

    return unsubscribe;
  }, []);

  // Update loading states when userDoc changes or loads
  useEffect(() => {
    if (authUser) {
      if (!userDocLoading) {
        // User document has loaded (or failed), we're done with user data loading
        setUserDataLoading(false);
        setAuthLoading(false);
      }
    }
  }, [authUser, userDocLoading]);

  // Handle errors from useDocument hook
  useEffect(() => {
    if (userDocError) {
      console.error("Error fetching user document:", userDocError);
      toast.error("Error loading user profile");
      setUserDataLoading(false);
      setAuthLoading(false);
    }
  }, [userDocError]);

  // Single effect to handle cart merging once user and user data are both available
  useEffect(() => {
    // Only attempt merge when all conditions are met and merge hasn't happened yet
    if (authUser && currentUser && fromCart && !cartMerged && !loading) {
      mergeLocalCartToUser(authUser.uid);
    }
  }, [authUser, currentUser, fromCart, cartMerged, loading]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      currentUser,
      authUser,
      signInWithGoogle,
      logout,
      loading,
      authLoading,
      userDataLoading,
      fromCart,
      setFromCart,
      // Reset cart merge state for testing/debugging if needed
      resetCartMerge: () => setCartMerged(false),
    }),
    [currentUser, authUser, loading, authLoading, userDataLoading, fromCart]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
