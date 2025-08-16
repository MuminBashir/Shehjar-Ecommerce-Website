import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth_context";
import { useCart } from "../../context/cart/cart_context";
import { useSale } from "../../context/sale/sale_context";
import { useCheckout } from "../../context/checkout/checkout_context";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Empty_Cart from "../../components/Empty_cart";
import CartItem from "../../components/CartItem";
import { IndianRupee } from "lucide-react";
import { toast } from "react-toastify";

const Cart = () => {
  const { currentUser, setFromCart } = useAuth();
  const { cartItems, loading: cartLoading, removeFromCart } = useCart();
  const { currentSale, hasActiveSale } = useSale();
  const { addItemsToCheckout } = useCheckout();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});

  // Fetch only the products in the cart
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cartItems.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }
      window.scrollTo(0, 0);

      try {
        // Get unique product IDs from cart items
        const productIds = [
          ...new Set(cartItems.map((item) => item.product_id)),
        ];

        // Fetch each product by ID
        const productPromises = productIds.map(async (id) => {
          const productRef = doc(db, "products", id);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            return { id: productSnap.id, ...productSnap.data() };
          }
          return null;
        });

        const products = await Promise.all(productPromises);
        const validProducts = products.filter((p) => p !== null);

        // Create a map for quick access
        const productsMap = {};
        validProducts.forEach((product) => {
          productsMap[product.id] = product;
        });

        // Map cart items to include product details
        const updatedCartProducts = cartItems
          .map((item) => {
            const product = productsMap[item.product_id];
            if (!product) return null;

            // Ensure we have the price from cart item or calculate from combination
            let itemPrice = item.price;
            if (!itemPrice) {
              // Fallback: get price from combination
              const combination = product.combinations?.find(
                (combo) =>
                  combo.size === item.size && combo.color === item.color
              );
              itemPrice = combination?.price || product.price || 0;
            }

            return { ...item, product, price: itemPrice };
          })
          .filter((item) => item !== null);

        setCartProducts(updatedCartProducts);

        // Initialize selection state for all items (all selected by default)
        const initialSelection = {};
        updatedCartProducts.forEach((item) => {
          const key = `${item.product_id}-${item.size}-${item.color}`;
          initialSelection[key] = true;
        });
        setSelectedItems(initialSelection);

        calculateTotals(updatedCartProducts, initialSelection);
      } catch (error) {
        console.error("Error fetching cart products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cartItems, cartLoading, hasActiveSale, currentSale]);

  // Calculate totals based on selected items
  const calculateTotals = (products, selectedState) => {
    let original = 0;
    let discounted = 0;

    products.forEach((item) => {
      const key = `${item.product_id}-${item.size}-${item.color}`;
      if (selectedState[key]) {
        // Use the item's stored price (combination price)
        const itemPrice = item.price || 0;

        // Calculate original price
        const itemOriginalTotal = itemPrice * item.quantity;
        original += itemOriginalTotal;

        // Apply discount if applicable
        const isOnSale =
          hasActiveSale && currentSale?.product_ids?.includes(item.product_id);

        if (isOnSale && currentSale?.discount_percentage) {
          const discountedPrice = Math.floor(
            itemPrice * (1 - currentSale.discount_percentage / 100)
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
  };

  const handleRemoveItem = (productId, size, color) => {
    removeFromCart(productId, size, color);
  };

  const handleToggleSelection = (productId, size, color) => {
    const key = `${productId}-${size}-${color}`;
    const newSelectedItems = {
      ...selectedItems,
      [key]: !selectedItems[key],
    };

    setSelectedItems(newSelectedItems);
    calculateTotals(cartProducts, newSelectedItems);
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedItems).every(Boolean);
    const newSelectedItems = {};

    cartProducts.forEach((item) => {
      const key = `${item.product_id}-${item.size}-${item.color}`;
      newSelectedItems[key] = !allSelected;
    });

    setSelectedItems(newSelectedItems);
    calculateTotals(cartProducts, newSelectedItems);
  };

  const handleCheckout = () => {
    // Check if any items are selected
    const hasSelectedItems = Object.values(selectedItems).some(Boolean);

    if (!hasSelectedItems) {
      toast.warning("Please select at least one item to proceed to checkout");
      return;
    }

    if (currentUser) {
      // Prepare items for checkout (only selected ones)
      const checkoutItems = cartProducts
        .filter(
          (item) =>
            selectedItems[`${item.product_id}-${item.size}-${item.color}`]
        )
        .map((item) => {
          const {
            product,
            product_id,
            quantity,
            size,
            color,
            price: itemPrice,
          } = item;

          return {
            product_id,
            title: product.name,
            image: product.thumbnail_image,
            color,
            size,
            quantity,
            price: itemPrice || 0, // Use the stored combination price
          };
        });

      // Add items to checkout context
      addItemsToCheckout(checkoutItems);

      // Navigate to checkout page
      navigate("/checkout");
    } else {
      setFromCart(true);
      navigate("/login");
      toast.warning("Please sign in to continue to checkout");
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading cart...
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return <Empty_Cart />;
  }

  // Check if any items are selected
  const someSelected = Object.values(selectedItems).some(Boolean);
  const allSelected = Object.values(selectedItems).every(Boolean);

  return (
    <div className="container mx-auto mt-32 px-4 py-8 md:mt-28">
      <h1 className="mb-6 text-2xl font-bold">Your Shopping Cart</h1>

      {hasActiveSale && totalSavings > 0 && someSelected && (
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

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleSelectAll}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          {allSelected ? "Unselect All" : "Select All"}
        </button>
        <div className="text-sm text-gray-500">
          {Object.values(selectedItems).filter(Boolean).length} of{" "}
          {cartProducts.length} items selected
        </div>
      </div>

      <div className="grid gap-6">
        {cartProducts.map((item, index) => {
          const key = `${item.product_id}-${item.size}-${item.color}`;
          return (
            <CartItem
              key={`${key}-${index}`}
              item={item}
              isSelected={!!selectedItems[key]}
              onToggleSelection={() =>
                handleToggleSelection(item.product_id, item.size, item.color)
              }
              onRemove={() =>
                handleRemoveItem(item.product_id, item.size, item.color)
              }
            />
          );
        })}
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-6">
        {someSelected ? (
          <>
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
          </>
        ) : (
          <div className="text-center text-gray-500">
            <p className="mb-4">No items selected</p>
            <button
              onClick={handleSelectAll}
              className="w-full rounded-md border border-primary bg-white py-3 font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Select Items to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
