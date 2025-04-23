// src/context/cart/cart_context.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../auth/auth_context";
import { toast } from "react-toastify";

// Create context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalCartProducts, setTotalCartProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load cart data when the component mounts or when auth state changes
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Fetch from Firestore if user is logged in
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCartItems(userData.cart || []);
          } else {
            setCartItems([]);
          }
        } else {
          // Fetch from localStorage if user is not logged in
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          setCartItems(localCart);
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
        toast.error("Failed to load your cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUser]);

  // This calculates the sum of quantities across all items
  useEffect(() => {
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setTotalCartProducts(totalQuantity);
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (
    productId,
    selectedSize,
    selectedColor,
    quantity
  ) => {
    try {
      setLoading(true);
      const cartItem = {
        product_id: productId,
        size: selectedSize,
        color: selectedColor,
        quantity,
        created_at: new Date().toISOString(),
      };

      if (currentUser) {
        // Add to Firebase if user is logged in
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentCart = userData.cart || [];

          // Check if item already exists
          const existingItemIndex = currentCart.findIndex(
            (item) =>
              item.product_id === productId &&
              item.size === selectedSize &&
              item.color === selectedColor
          );

          let updatedCart;

          if (existingItemIndex !== -1) {
            // Update existing item
            updatedCart = [...currentCart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + quantity,
            };
          } else {
            // Add new item
            updatedCart = [...currentCart, cartItem];
          }

          await updateDoc(userRef, { cart: updatedCart });
          setCartItems(updatedCart);
          toast.success("Added to cart successfully!");
        } else {
          toast.error("Failed to update cart. User data not found.");
        }
      } else {
        // Add to localStorage if user is not logged in
        const existingCart = [...cartItems];

        // Check if item already exists
        const existingItemIndex = existingCart.findIndex(
          (item) =>
            item.product_id === productId &&
            item.size === selectedSize &&
            item.color === selectedColor
        );

        if (existingItemIndex !== -1) {
          // Update existing item
          existingCart[existingItemIndex] = {
            ...existingCart[existingItemIndex],
            quantity: existingCart[existingItemIndex].quantity + quantity,
          };
        } else {
          // Add new item
          existingCart.push(cartItem);
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        setCartItems(existingCart);
        toast.success("Added to cart successfully!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add item to cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId, selectedSize, selectedColor) => {
    try {
      setLoading(true);

      if (currentUser) {
        // Remove from Firebase if user is logged in
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentCart = userData.cart || [];

          const updatedCart = currentCart.filter(
            (item) =>
              !(
                item.product_id === productId &&
                item.size === selectedSize &&
                item.color === selectedColor
              )
          );

          await updateDoc(userRef, { cart: updatedCart });
          setCartItems(updatedCart);
          toast.success("Item removed from cart");
        }
      } else {
        // Remove from localStorage if user is not logged in
        const existingCart = [...cartItems];

        const updatedCart = existingCart.filter(
          (item) =>
            !(
              item.product_id === productId &&
              item.size === selectedSize &&
              item.color === selectedColor
            )
        );

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(`Failed to remove item from cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity in cart
  const updateCartItemQuantity = async (
    productId,
    selectedSize,
    selectedColor,
    newQuantity
  ) => {
    try {
      setLoading(true);

      if (currentUser) {
        // Update in Firebase if user is logged in
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentCart = userData.cart || [];

          const updatedCart = currentCart.map((item) => {
            if (
              item.product_id === productId &&
              item.size === selectedSize &&
              item.color === selectedColor
            ) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          });

          await updateDoc(userRef, { cart: updatedCart });
          setCartItems(updatedCart);
          toast.success("Cart updated");
        }
      } else {
        // Update in localStorage if user is not logged in
        const existingCart = [...cartItems];

        const updatedCart = existingCart.map((item) => {
          if (
            item.product_id === productId &&
            item.size === selectedSize &&
            item.color === selectedColor
          ) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        toast.success("Cart updated");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(`Failed to update cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      setLoading(true);

      if (currentUser) {
        // Clear Firebase cart if user is logged in
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { cart: [] });
      }

      // Clear localStorage cart
      localStorage.setItem("cart", JSON.stringify([]));
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error(`Failed to clear cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // When user logs in, merge localStorage cart with user's cart in Firestore
  const mergeCartsAfterLogin = async (userId) => {
    try {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (localCart.length === 0) return;

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userCart = userData.cart || [];

        // Create a merged cart with no duplicates
        const mergedCart = [...userCart];

        localCart.forEach((localItem) => {
          const existingItemIndex = mergedCart.findIndex(
            (item) =>
              item.product_id === localItem.product_id &&
              item.size === localItem.size &&
              item.color === localItem.color
          );

          if (existingItemIndex !== -1) {
            // Update quantity if item exists
            mergedCart[existingItemIndex].quantity += localItem.quantity;
          } else {
            // Add new item if not exists
            mergedCart.push(localItem);
          }
        });

        // Update Firebase and clear localStorage
        await updateDoc(userRef, { cart: mergedCart });
        localStorage.setItem("cart", JSON.stringify([]));
        setCartItems(mergedCart);
      }
    } catch (error) {
      console.error("Error merging carts:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCartProducts,
        loading,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        mergeCartsAfterLogin,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
