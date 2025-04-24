import { IndianRupee, Trash2, Plus, Minus } from "lucide-react";
import React, { useMemo } from "react";
import { useCart } from "../context/cart/cart_context";
import { useSale } from "../context/sale/sale_context";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const CartItem = ({ item, onRemove }) => {
  const { product, quantity, size, color, product_id } = item;
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

  const originalPrice = product.price;
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
    <div className="flex flex-col rounded-lg border p-4 shadow-sm md:flex-row">
      <div className="mb-4 h-32 w-full flex-shrink-0 md:mb-0 md:w-32">
        <Link to={`/shop/${product_id}`}>
          <img
            src={product.thumbnail_image}
            alt={product.name}
            className="h-full w-full cursor-pointer rounded-md object-cover transition-transform hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-grow flex-col md:ml-6">
        <div className="flex items-start justify-between">
          <div>
            <Link
              to={`/shop/${product_id}`}
              className="hover:text-primary hover:underline"
            >
              <h3 className="cursor-pointer text-lg font-medium">
                {product.name}
              </h3>
            </Link>
            <div className="mt-1 text-sm text-gray-600">
              <span className="mr-4">Size: {size}</span>
              <span>Color: {color}</span>
            </div>
          </div>
          <div className="text-lg font-medium">
            {isOnSale ? (
              <>
                <span className="text-red-600">
                  <IndianRupee size={16} className="inline" />
                  {discountedPrice}
                </span>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  <IndianRupee size={12} className="inline" />
                  {originalPrice}
                </span>
                <span className="ml-2 text-xs text-green-600">
                  {discountPercentage}% off
                </span>
              </>
            ) : (
              <>
                <IndianRupee size={16} className="inline" />
                {originalPrice}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <span className="mr-2 text-sm">Quantity:</span>
          <div className="flex items-center rounded-md border">
            <button
              onClick={handleDecreaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="px-4 text-center">{quantity}</span>
            <button
              onClick={handleIncreaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled={quantity >= availableQuantity}
            >
              <Plus size={16} />
            </button>
          </div>
          {availableQuantity > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({availableQuantity} available)
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-lg font-medium">
            {isOnSale ? (
              <>
                <span className="text-red-600">
                  <IndianRupee size={16} className="inline" />
                  {discountedPrice * quantity}
                </span>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  <IndianRupee size={12} className="inline" />
                  {originalPrice * quantity}
                </span>
              </>
            ) : (
              <>
                <IndianRupee size={16} className="inline" />
                {originalPrice * quantity}
              </>
            )}
          </div>
          <button
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-800"
            aria-label="Remove item"
          >
            <Trash2 size={20} className="inline" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
