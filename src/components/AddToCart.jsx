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
  const { addToCart } = useCart();

  // Reset quantity when product details change
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  const handleAddToCart = async () => {
    if (availableQuantity <= 0 || loading) return;

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
