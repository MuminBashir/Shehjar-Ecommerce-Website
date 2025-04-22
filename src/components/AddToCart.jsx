import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/auth/auth_context";
import { toast } from "react-toastify";

const AddToCart = ({
  productId,
  selectedSize,
  selectedColor,
  availableQuantity,
  isCard = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Reset quantity when product details change
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  const addToLocalStorage = (cartItem) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if same product with same options exists
    const existingItemIndex = existingCart.findIndex(
      (item) =>
        item.product_id === productId &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
  };

  const addToUserCart = async () => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Get current cart data
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
          // Create a new cart array with updated quantity
          updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + quantity,
          };
        } else {
          // Add new item to cart with only the necessary fields
          updatedCart = [
            ...currentCart,
            {
              product_id: productId,
              size: selectedSize,
              color: selectedColor,
              quantity,
              created_at: new Date().toISOString(),
            },
          ];
        }

        // Update the entire cart array
        await updateDoc(userRef, { cart: updatedCart });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const handleAddToCart = async () => {
    if (availableQuantity <= 0 || loading) return;

    setLoading(true);

    const cartItem = {
      product_id: productId,
      size: selectedSize,
      color: selectedColor,
      quantity,
      created_at: new Date().toISOString(),
    };

    try {
      if (currentUser) {
        const success = await addToUserCart();
        if (success) {
          toast.success("Added to cart successfully!");
        } else {
          toast.error("Failed to update cart. User data not found.");
        }
      } else {
        addToLocalStorage(cartItem);
        toast.success("Added to cart successfully!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add item to cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* Quantity Selector and Add to Cart */}
      <div
        className={`flex flex-col gap-4 ${
          isCard ? "" : "sm:flex-row sm:items-center"
        }`}
      >
        {/* Quantity Selector */}
        <div className="flex w-full max-w-[120px] items-center justify-between rounded-md border border-gray-300 px-2 py-2">
          <button
            className="text-lg font-semibold text-gray-600 disabled:opacity-30"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="text-center font-medium">{quantity}</span>
          <button
            className="text-lg font-semibold text-gray-600 disabled:opacity-30"
            onClick={() =>
              setQuantity((q) => Math.min(availableQuantity, q + 1))
            }
            disabled={quantity >= availableQuantity}
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          className={`w-full rounded-md py-3 px-4 font-medium sm:w-auto ${
            availableQuantity > 0
              ? "border border-primary bg-primary text-white transition-colors hover:bg-white hover:text-primary"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          onClick={handleAddToCart}
          disabled={availableQuantity <= 0 || loading}
        >
          {loading
            ? "Adding..."
            : availableQuantity > 0
            ? "Add to Cart"
            : "Out of Stock"}
        </button>
      </div>

      {/* Availability */}
      <div className="mt-2">
        <p
          className={`${
            availableQuantity > 0 ? "text-green-600" : "text-red-600"
          } text-md`}
        >
          {availableQuantity > 0 ? `In stock` : "Currently out of stock"}
        </p>
      </div>
    </div>
  );
};

export default AddToCart;
