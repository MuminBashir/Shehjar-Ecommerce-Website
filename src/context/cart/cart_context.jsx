// src/context/cart/cart_context.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../auth/auth_context";
import { toast } from "react-toastify";
import { useDocument } from "react-firebase-hooks/firestore";

// Create context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalCartProducts, setTotalCartProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Use react-firebase-hooks to get real-time updates for user data
  const [userDoc, userLoading, userError] = useDocument(
    currentUser ? doc(db, "users", currentUser.uid) : null,
    { snapshotListenOptions: { includeMetadataChanges: true } }
  );

  // Validate products exist using batch query instead of loading all products
  const validateProductsExist = useCallback(async (productIds) => {
    if (!productIds || productIds.length === 0) return [];

    try {
      // Split into chunks of 10 (Firestore limit for 'in' queries)
      const chunkSize = 10;
      const validProductIds = [];

      for (let i = 0; i < productIds.length; i += chunkSize) {
        const chunk = productIds.slice(i, i + chunkSize);
        const q = query(
          collection(db, "products"),
          where("__name__", "in", chunk)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          validProductIds.push(doc.id);
        });
      }

      return validProductIds;
    } catch (error) {
      console.error("Error validating products:", error);
      return [];
    }
  }, []);

  // Clean up cart items for deleted products
  const cleanupDeletedProductsFromCart = useCallback(
    async (currentCart) => {
      if (!currentCart || currentCart.length === 0) return [];

      try {
        // Extract unique product IDs from cart
        const productIds = [
          ...new Set(currentCart.map((item) => item.product_id)),
        ];

        // Validate which products still exist
        const validProductIds = await validateProductsExist(productIds);

        // Filter cart items
        const validCartItems = currentCart.filter((item) =>
          validProductIds.includes(item.product_id)
        );

        // If some items were filtered out, update the cart
        if (validCartItems.length < currentCart.length) {
          if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { cart: validCartItems });
            toast.info(
              "Some items were removed from your cart because they are no longer available."
            );
          } else {
            localStorage.setItem("cart", JSON.stringify(validCartItems));
          }
        }

        return validCartItems;
      } catch (error) {
        console.error("Error cleaning up deleted products from cart:", error);
        return currentCart; // Return original cart if cleanup fails
      }
    },
    [currentUser, validateProductsExist]
  );

  // Load cart data when user data changes
  useEffect(() => {
    const processCart = async () => {
      setLoading(true);
      try {
        if (currentUser && userDoc) {
          // User is logged in and we have their data
          const userData = userDoc.data();
          if (userData) {
            const fetchedCart = userData.cart || [];

            // Clean up deleted products from the cart - run this periodically, not on every load
            // Only run full validation if last validation was more than 1 hour ago
            const lastValidation = localStorage.getItem("lastCartValidation");
            const shouldValidate =
              !lastValidation ||
              Date.now() - parseInt(lastValidation) > 3600000; // 1 hour

            if (shouldValidate) {
              const cleanedCart = await cleanupDeletedProductsFromCart(
                fetchedCart
              );
              setCartItems(cleanedCart);
              localStorage.setItem("lastCartValidation", Date.now().toString());
            } else {
              setCartItems(fetchedCart);
            }
          } else {
            setCartItems([]);
          }
        } else if (!currentUser) {
          // User is not logged in, use localStorage
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

          // Only validate periodically for local cart as well
          const lastValidation = localStorage.getItem("lastCartValidation");
          const shouldValidate =
            !lastValidation || Date.now() - parseInt(lastValidation) > 3600000; // 1 hour

          if (shouldValidate) {
            const cleanedLocalCart = await cleanupDeletedProductsFromCart(
              localCart
            );
            setCartItems(cleanedLocalCart);
            localStorage.setItem("lastCartValidation", Date.now().toString());
          } else {
            setCartItems(localCart);
          }
        }
      } catch (error) {
        console.error("Error processing cart data:", error);
        toast.error("Failed to load your cart");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      processCart();
    }
  }, [currentUser, userDoc, userLoading, cleanupDeletedProductsFromCart]);

  // Calculate total products - use useMemo to avoid unnecessary recalculations
  const totalProducts = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Update total products when cartItems change
  useEffect(() => {
    setTotalCartProducts(totalProducts);
  }, [totalProducts]);

  // Check if a single product exists
  const validateSingleProduct = useCallback(async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      return productSnap.exists();
    } catch (error) {
      console.error("Error validating product:", error);
      return false;
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(
    async (productId, selectedSize, selectedColor, quantity) => {
      try {
        setLoading(true);

        // Check if the product exists - only validate the specific product
        const productExists = await validateSingleProduct(productId);
        if (!productExists) {
          toast.error("This product is no longer available.");
          return;
        }

        // Get the product data to extract the combination price
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        let combinationPrice = 0;

        if (productSnap.exists()) {
          const productData = productSnap.data();
          // Find the specific combination to get its price
          const combination = productData.combinations?.find(
            (combo) =>
              combo.size === selectedSize && combo.color === selectedColor
          );
          combinationPrice = combination?.price || productData.price || 0;
        }

        const cartItem = {
          product_id: productId,
          size: selectedSize,
          color: selectedColor,
          quantity,
          price: combinationPrice, // Store the combination price
          created_at: new Date().toISOString(),
        };

        if (currentUser) {
          // Add to Firebase if user is logged in
          if (userDoc?.exists()) {
            const userData = userDoc.data();
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

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { cart: updatedCart });
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
    },
    [cartItems, currentUser, userDoc, validateSingleProduct]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId, selectedSize, selectedColor, showToast = true) => {
      try {
        if (currentUser) {
          // Remove from Firebase if user is logged in
          if (userDoc?.exists()) {
            const userData = userDoc.data();
            const currentCart = userData.cart || [];

            const updatedCart = currentCart.filter(
              (item) =>
                !(
                  item.product_id === productId &&
                  item.size === selectedSize &&
                  item.color === selectedColor
                )
            );

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { cart: updatedCart });

            if (showToast) {
              toast.success("Item removed from cart");
            }

            // Let Firestore listener update the state naturally
            // instead of manipulating local state
            return true;
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

          if (showToast) {
            toast.success("Item removed from cart");
          }

          return true;
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        if (showToast) {
          toast.error(`Failed to remove item from cart: ${error.message}`);
        }
        return false;
      }
    },
    [cartItems, currentUser, userDoc]
  );

  // Update item quantity in cart
  const updateCartItemQuantity = useCallback(
    async (productId, selectedSize, selectedColor, newQuantity) => {
      try {
        setLoading(true);

        // Only check product existence when necessary (not on every quantity update)
        // Could add periodic validation or validate on checkout instead

        if (currentUser) {
          // Update in Firebase if user is logged in
          if (userDoc?.exists()) {
            const userData = userDoc.data();
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

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { cart: updatedCart });
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
    },
    [cartItems, currentUser, userDoc]
  );

  // Clear the entire cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);

      if (currentUser) {
        // Clear Firebase cart if user is logged in
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { cart: [] });
      } else {
        // Clear localStorage cart
        localStorage.setItem("cart", JSON.stringify([]));
        setCartItems([]);
      }
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error(`Failed to clear cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cartItems,
      totalCartProducts,
      loading: loading || userLoading,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
    }),
    [
      cartItems,
      totalCartProducts,
      loading,
      userLoading,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
