import React, { useState, useEffect } from "react";
import { useCart } from "../context/cart/cart_context";
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
  const { addToCart, cartItems } = useCart();

  // Reset quantity when product details change
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  // Calculate how many of this specific item (same product, size, and color) are already in the cart
  const itemsAlreadyInCart = React.useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;

    const existingItem = cartItems.find(
      (item) =>
        item.product_id === productId &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    return existingItem ? existingItem.quantity : 0;
  }, [cartItems, productId, selectedSize, selectedColor]);

  // Calculate remaining available quantity after subtracting items already in cart
  const actualAvailableQuantity = Math.max(
    0,
    availableQuantity - itemsAlreadyInCart
  );

  const handleAddToCart = async () => {
    if (availableQuantity <= 0 || loading) return;

    // Check if adding this quantity would exceed what's actually available
    if (quantity > actualAvailableQuantity) {
      const message =
        itemsAlreadyInCart > 0
          ? `You already have ${itemsAlreadyInCart} of this item in your cart. Only ${availableQuantity} total are available.`
          : `Sorry, only ${availableQuantity} items are available.`;

      toast.warning(message);
      return;
    }

    setLoading(true);
    try {
      await addToCart(productId, selectedSize, selectedColor, quantity);
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
              setQuantity((q) => Math.min(actualAvailableQuantity, q + 1))
            }
            disabled={quantity >= actualAvailableQuantity}
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          className={`w-full rounded-md py-3 px-4 font-medium sm:w-auto ${
            actualAvailableQuantity > 0
              ? "border border-primary bg-primary text-white transition-colors hover:bg-white hover:text-primary"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          onClick={handleAddToCart}
          disabled={actualAvailableQuantity <= 0 || loading}
        >
          {loading
            ? "Adding..."
            : actualAvailableQuantity > 0
            ? "Add to Cart"
            : itemsAlreadyInCart > 0
            ? "Max in Cart"
            : "Out of Stock"}
        </button>
      </div>

      {/* Availability */}
      <div className="mt-2">
        {itemsAlreadyInCart > 0 && (
          <p className="text-sm text-gray-600">{itemsAlreadyInCart} in cart</p>
        )}
        <p
          className={`${
            actualAvailableQuantity > 0 ? "text-green-600" : "text-red-600"
          } text-sm`}
        >
          {actualAvailableQuantity > 0
            ? `${actualAvailableQuantity} available in stock`
            : itemsAlreadyInCart > 0
            ? "Maximum quantity in cart"
            : "Currently out of stock"}
        </p>
      </div>
    </div>
  );
};

export default AddToCart;
