import React, { createContext, useContext, useState, useEffect } from "react";
import { useSale } from "../sale/sale_context";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const CheckoutContext = createContext();

export function useCheckout() {
  return useContext(CheckoutContext);
}

export function CheckoutProvider({ children }) {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryRates, setDeliveryRates] = useState({
    indian_delivery_cost: 0,
    international_delivery_cost: 0,
  });

  const { currentSale, hasActiveSale } = useSale();

  // Fetch delivery costs from Firebase on component mount
  useEffect(() => {
    const fetchDeliveryRates = async () => {
      try {
        const db = getFirestore();
        const deliveryDocRef = doc(db, "delivery", "current_delivery");
        const deliveryDocSnap = await getDoc(deliveryDocRef);

        if (deliveryDocSnap.exists()) {
          const data = deliveryDocSnap.data();
          setDeliveryRates({
            indian_delivery_cost: data.indian_delivery_cost || 0,
            international_delivery_cost: data.international_delivery_cost || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching delivery rates:", error);
      }
    };

    fetchDeliveryRates();
  }, []);

  // Calculate totals whenever checkout items or delivery cost change
  useEffect(() => {
    if (checkoutItems.length === 0) {
      setSubtotal(0);
      setDiscountedTotal(0);
      setTotalSavings(0);
      return;
    }
    let original = 0;
    let discounted = 0;

    checkoutItems.forEach((item) => {
      const itemOriginalTotal = item.price * item.quantity;
      original += itemOriginalTotal;

      if (item.isOnSale && item.discountedPrice) {
        const itemDiscountedTotal = item.discountedPrice * item.quantity;
        discounted += itemDiscountedTotal;
      } else {
        discounted += itemOriginalTotal;
      }
    });

    setSubtotal(original);
    setDiscountedTotal(discounted);
    setTotalSavings(original - discounted);
  }, [checkoutItems]);

  useEffect(() => {
    if (loading) return;
    console.log("Checkout items updated:", checkoutItems);
  }, [checkoutItems]);

  // Update delivery cost when delivery address changes
  useEffect(() => {
    if (!deliveryAddress) {
      setDeliveryCost(0);
      return;
    }

    // Check if the delivery address is in India
    const isIndianAddress = deliveryAddress.country === "IN";

    // Set delivery cost based on address location
    const cost = isIndianAddress
      ? deliveryRates.indian_delivery_cost
      : deliveryRates.international_delivery_cost;

    setDeliveryCost(cost);
    console.log(
      `Delivery cost set to ${cost} (${
        isIndianAddress ? "Indian" : "International"
      })`
    );
  }, [deliveryAddress, deliveryRates]);

  // Function to set delivery address
  const updateDeliveryAddress = (address) => {
    setDeliveryAddress(address);
  };

  // Function to add items to checkout
  const addItemsToCheckout = (items) => {
    setLoading(true);

    try {
      // Process items to include sale information
      const processedItems = items.map((item) => {
        const isOnSale =
          hasActiveSale && currentSale?.product_ids?.includes(item.product_id);
        const discountPercentage = isOnSale
          ? currentSale?.discount_percentage || 0
          : 0;

        // Calculate discounted price if applicable
        const originalPrice = item.price;
        const discountedPrice = isOnSale
          ? Math.floor(originalPrice * (1 - discountPercentage / 100))
          : null;

        return {
          ...item,
          isOnSale,
          discountPercentage: isOnSale ? discountPercentage : 0,
          discountedPrice,
        };
      });

      // Replace existing items with new ones
      setCheckoutItems(processedItems);
    } catch (error) {
      console.error("Error adding items to checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear checkout items
  const clearCheckout = () => {
    setCheckoutItems([]);
    setSubtotal(0);
    setDiscountedTotal(0);
    setTotalSavings(0);
    setDeliveryAddress(null);
    setDeliveryCost(0);
  };

  // Calculate the final total (discounted items + delivery cost)
  const finalTotal = discountedTotal + deliveryCost;

  const value = {
    checkoutItems,
    loading,
    subtotal,
    discountedTotal,
    totalSavings,
    hasDiscount: totalSavings > 0,
    deliveryAddress,
    deliveryCost,
    finalTotal,
    addItemsToCheckout,
    clearCheckout,
    updateDeliveryAddress,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
