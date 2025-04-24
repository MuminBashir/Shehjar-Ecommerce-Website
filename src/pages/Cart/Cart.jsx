import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth_context";
import { useCart } from "../../context/cart/cart_context";
import { useSale } from "../../context/sale/sale_context";
import { db } from "../../firebase/config";
import { collection, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Empty_Cart from "../../components/Empty_cart";
import CartItem from "../../components/CartItem";
import { IndianRupee } from "lucide-react";

const Cart = () => {
  const { currentUser } = useAuth();
  const { cartItems, loading: cartLoading, removeFromCart } = useCart();
  const { currentSale, hasActiveSale } = useSale(); // Get sale information
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [originalTotal, setOriginalTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all products once (we'll filter what we need)
  const productsQuery = query(collection(db, "products"));
  const [productsData, productsLoading] = useCollectionData(productsQuery);

  useEffect(() => {
    // Create a lookup map of products by ID for quick access
    if (productsData) {
      const productsMap = {};
      productsData.forEach((product) => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    }
  }, [productsData]);

  useEffect(() => {
    // Calculate total price once we have all data
    if (cartItems.length > 0 && Object.keys(products).length > 0) {
      let original = 0;
      let discounted = 0;

      cartItems.forEach((item) => {
        const product = products[item.product_id];
        if (product) {
          // Calculate original price
          const itemOriginalTotal = product.price * item.quantity;
          original += itemOriginalTotal;

          // Apply discount if applicable
          const isOnSale =
            hasActiveSale &&
            currentSale?.product_ids?.includes(item.product_id);

          if (isOnSale && currentSale?.discount_percentage) {
            const discountedPrice = Math.floor(
              product.price * (1 - currentSale.discount_percentage / 100)
            );
            const itemDiscountedTotal = discountedPrice * item.quantity;
            discounted += itemDiscountedTotal;
          } else {
            discounted += itemOriginalTotal;
          }
        }
      });

      setOriginalTotal(original);
      setDiscountedTotal(discounted);
      setTotalSavings(original - discounted);
    } else {
      setOriginalTotal(0);
      setDiscountedTotal(0);
      setTotalSavings(0);
    }

    setLoading(cartLoading || productsLoading);
  }, [
    cartItems,
    products,
    cartLoading,
    productsLoading,
    hasActiveSale,
    currentSale,
  ]);

  const handleRemoveItem = (productId, size, color) => {
    removeFromCart(productId, size, color);
  };

  const handleCheckout = () => {
    if (currentUser) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { redirectTo: "/checkout" } });
    }
  };

  const getCartItems = () => {
    return cartItems
      .map((item) => ({ ...item, product: products[item.product_id] }))
      .filter((item) => item.product); // Only include items where we have the product data
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading cart...
      </div>
    );
  }

  const displayCartItems = getCartItems();

  if (displayCartItems.length === 0) {
    return <Empty_Cart />;
  }

  return (
    <div className="container mx-auto mt-20 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Shopping Cart</h1>

      {hasActiveSale && totalSavings > 0 && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
          <p className="font-medium">
            Sale Active! You're saving{" "}
            <IndianRupee size={16} className="inline" />
            {Math.floor(totalSavings)} with our current sale
          </p>
          <p className="text-sm">
            {currentSale?.discount_percentage}% off on selected products
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {displayCartItems.map((item, index) => (
          <CartItem
            key={`${item.product_id}-${item.size}-${item.color}-${index}`}
            item={item}
            onRemove={() =>
              handleRemoveItem(item.product_id, item.size, item.color)
            }
          />
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        {hasActiveSale && totalSavings > 0 ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">Original Price:</span>
              <span className="text-gray-600 line-through">
                <IndianRupee size={16} className="inline" />
                {originalTotal}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-green-600">Discount:</span>
              <span className="text-green-600">
                - <IndianRupee size={16} className="inline" />
                {Math.floor(totalSavings)}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between border-t pt-2">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-xl font-bold">
                <IndianRupee size={20} className="inline font-bold" />
                {Math.floor(discountedTotal)}
              </span>
            </div>
          </>
        ) : (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-xl font-bold">
              <IndianRupee size={20} className="inline font-bold" />
              {Math.floor(originalTotal)}
            </span>
          </div>
        )}

        <button
          onClick={handleCheckout}
          className="w-full rounded-md border border-primary bg-primary py-3 font-medium text-white transition-colors hover:bg-white hover:text-primary"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
