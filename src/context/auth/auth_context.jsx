import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { auth, db } from "../../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [fromCart, setFromCart] = useState(false);

  // Use the useDocument hook to get real-time updates
  const [userDoc, userDocLoading, userDocError] = useDocument(
    authUser ? doc(db, "users", authUser.uid) : null
  );

  // Handle Google Sign In
  const signInWithGoogle = async () => {
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
        });
      }

      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoaded(true); // Mark auth loading as complete

      if (!user) {
        setCurrentUser(null);
        setLoading(false);
      }
      // We don't set loading to false here if the user is logged in
      // because we'll wait for the Firestore data
    });

    return unsubscribe;
  }, []);

  // Update currentUser when userDoc changes
  useEffect(() => {
    // Only proceed if auth is loaded
    if (!authLoaded) return;

    // If no auth user, we already set loading false in the auth effect
    if (!authUser) return;

    // If we're still loading the user doc, wait
    if (userDocLoading) return;

    if (userDoc && userDoc.exists()) {
      setCurrentUser(userDoc.data());
    }

    // Now we can safely say everything is loaded
    setLoading(false);
  }, [userDoc, userDocLoading, authUser, authLoaded]);

  // Handle errors from useDocument hook
  useEffect(() => {
    if (userDocError) {
      console.error("Error fetching user document:", userDocError);
      setLoading(false);
    }
  }, [userDocError]);

  const value = {
    currentUser,
    authUser,
    signInWithGoogle,
    logout,
    loading,
    fromCart,
    setFromCart,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
