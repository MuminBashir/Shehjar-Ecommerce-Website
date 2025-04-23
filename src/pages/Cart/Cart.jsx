import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth_context";
import { useCart } from "../../context/cart/cart_context";
import { db } from "../../firebase/config";
import { collection, query } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Empty_Cart from "../../components/Empty_cart";
import CartItem from "../../components/CartItem";
import { IndianRupee } from "lucide-react";
import { toast } from "react-toastify";

const Cart = () => {
  const { currentUser } = useAuth();
  const { cartItems, loading: cartLoading, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
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
      const total = cartItems.reduce((sum, item) => {
        const product = products[item.product_id];
        if (product) {
          return sum + product.price * item.quantity;
        }
        return sum;
      }, 0);

      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }

    setLoading(cartLoading || productsLoading);
  }, [cartItems, products, cartLoading, productsLoading]);

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
    <div className="container mx-auto mt-10 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Shopping Cart</h1>

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
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-xl font-bold">
            <IndianRupee size={20} className="inline font-bold" />
            {totalPrice.toFixed(2)}
          </span>
        </div>

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
