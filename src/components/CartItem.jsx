import { IndianRupee, Trash2, Plus, Minus, Check } from "lucide-react";
import React, { useMemo } from "react";
import { useCart } from "../context/cart/cart_context";
import { useSale } from "../context/sale/sale_context";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const CartItem = ({ item, onRemove, isSelected, onToggleSelection }) => {
  const {
    product,
    quantity,
    size,
    color,
    product_id,
    price: cartItemPrice,
  } = item;
  const { updateCartItemQuantity } = useCart();
  const { currentSale, hasActiveSale } = useSale(); // Get sale information

  if (!product) {
    return null;
  }

  // Calculate discounted price if product is on sale
  const isOnSale = useMemo(() => {
    return hasActiveSale && currentSale?.product_ids?.includes(product_id);
  }, [hasActiveSale, currentSale, product_id]);

  const discountPercentage = isOnSale
    ? currentSale?.discount_percentage || 0
    : 0;

  // Use cart item price if available, otherwise fallback to combination price from product, then product price
  const originalPrice =
    cartItemPrice ||
    (() => {
      const combination = product.combinations?.find(
        (combo) => combo.size === size && combo.color === color
      );
      return combination?.price || product.price || 0;
    })();

  const discountedPrice = isOnSale
    ? Math.floor(originalPrice * (1 - discountPercentage / 100))
    : originalPrice;

  // Find available quantity for this specific size and color combination
  const availableQuantity = useMemo(() => {
    if (!product.combinations || !Array.isArray(product.combinations)) {
      return 0;
    }

    const combination = product.combinations.find(
      (combo) => combo.size === size && combo.color === color
    );

    return combination ? combination.quantity : 0;
  }, [product, size, color]);

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;

    // Check if increasing would exceed available inventory
    if (newQuantity > availableQuantity) {
      toast.warning(
        `Sorry, only ${availableQuantity} items available in this size and color.`
      );
      return;
    }

    updateCartItemQuantity(product_id, size, color, newQuantity);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      updateCartItemQuantity(product_id, size, color, newQuantity);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {/* Selection Checkbox - Now outside the card */}
      <div className="pt-2">
        <button
          onClick={onToggleSelection}
          className={`flex h-6 w-6 items-center justify-center rounded-sm border ${
            isSelected
              ? "border-primary bg-primary text-white"
              : "border-gray-300 bg-white"
          }`}
          aria-label={isSelected ? "Deselect item" : "Select item"}
        >
          {isSelected && <Check size={14} />}
        </button>
      </div>

      {/* Main Card */}
      <div
        className={`flex flex-grow flex-col rounded-lg border p-3 shadow-sm md:flex-row md:p-4 ${
          isSelected ? "border-primary" : ""
        }`}
      >
        {/* Product Image - Takes full width on mobile, fixed width on desktop */}
        <div className="mb-3 h-40 w-full flex-shrink-0 md:mb-0 md:h-32 md:w-32">
          <Link to={`/shop/${product_id}`}>
            <img
              src={product.thumbnail_image}
              alt={product.name}
              className="h-full w-full cursor-pointer rounded-md object-cover transition-transform hover:scale-105"
            />
          </Link>
        </div>

        <div className="flex flex-grow flex-col md:ml-6">
          {/* Product Header - Stacks on mobile */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <Link
                to={`/shop/${product_id}`}
                className="hover:text-primary hover:underline"
              >
                <h3 className="cursor-pointer text-base font-medium md:text-lg">
                  {product.name}
                </h3>
              </Link>
              <div className="mt-1 text-xs text-gray-600 md:text-sm">
                <span className="mr-4">Size: {size}</span>
                <span>Color: {color}</span>
              </div>
            </div>
            <div className="text-base font-medium md:text-lg">
              {isOnSale ? (
                <div className="flex flex-wrap items-center">
                  <span className="flex items-center text-red-600">
                    <IndianRupee size={14} className="inline md:hidden" />
                    <IndianRupee size={16} className="hidden md:inline" />
                    {discountedPrice}
                  </span>
                  <span className="ml-2 flex items-center text-xs text-gray-500 line-through md:text-sm">
                    <IndianRupee size={10} className="inline md:hidden" />
                    <IndianRupee size={12} className="hidden md:inline" />
                    {originalPrice}
                  </span>
                  <span className="ml-2 text-xs text-green-600">
                    {discountPercentage}% off
                  </span>
                </div>
              ) : (
                <span className="flex items-center">
                  <IndianRupee size={14} className="inline md:hidden" />
                  <IndianRupee size={16} className="hidden md:inline" />
                  {originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector - Optimized spacing for mobile */}
          <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-4">
            <span className="mr-1 text-xs md:text-sm">Quantity:</span>
            <div className="flex items-center rounded-md border">
              <button
                onClick={handleDecreaseQuantity}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={14} className="md:hidden" />
                <Minus size={16} className="hidden md:inline" />
              </button>
              <span className="px-3 text-center text-sm md:px-4 md:text-base">
                {quantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                disabled={quantity >= availableQuantity}
              >
                <Plus size={14} className="md:hidden" />
                <Plus size={16} className="hidden md:inline" />
              </button>
            </div>
            {availableQuantity > 0 && (
              <span className="text-xs text-gray-500">
                ({availableQuantity} available)
              </span>
            )}
          </div>

          {/* Price and Remove Button */}
          <div className="mt-auto flex items-center justify-between pt-3 md:pt-4">
            <div className="text-base font-medium md:text-lg">
              {isOnSale ? (
                <div className="flex items-center">
                  <span className="flex items-center text-red-600">
                    <IndianRupee size={14} className="inline md:hidden" />
                    <IndianRupee size={16} className="hidden md:inline" />
                    {discountedPrice * quantity}
                  </span>
                  <span className="ml-2 flex items-center text-xs text-gray-500 line-through md:text-sm">
                    <IndianRupee size={10} className="inline md:hidden" />
                    <IndianRupee size={12} className="hidden md:inline" />
                    {originalPrice * quantity}
                  </span>
                </div>
              ) : (
                <span className="flex items-center">
                  <IndianRupee size={14} className="inline md:hidden" />
                  <IndianRupee size={16} className="hidden md:inline" />
                  {originalPrice * quantity}
                </span>
              )}
            </div>
            <button
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-800"
              aria-label="Remove item"
            >
              <Trash2 size={18} className="inline md:hidden" />
              <Trash2 size={20} className="hidden md:inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
