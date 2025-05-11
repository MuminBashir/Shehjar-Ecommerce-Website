import React, { createContext, useContext, useState, useEffect } from "react";
import { useSale } from "../sale/sale_context";
import { getFirestore, doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

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
    free_indian_delivery: 0,
    free_international_delivery: 0,
    allow_orders: true,
  });
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [amountAwayFromFreeDelivery, setAmountAwayFromFreeDelivery] =
    useState(0);
  const [freeDeliveryEligible, setFreeDeliveryEligible] = useState(false);

  const { currentSale, hasActiveSale } = useSale();
  const db = getFirestore();
  const [deliveryDoc, deliveryLoading] = useDocument(
    doc(db, "delivery", "current_delivery")
  );

  // Update delivery rates when document changes
  useEffect(() => {
    if (deliveryDoc?.exists()) {
      const data = deliveryDoc.data();
      setDeliveryRates({
        indian_delivery_cost: data.indian_delivery_cost || 0,
        international_delivery_cost: data.international_delivery_cost || 0,
        free_indian_delivery: data.free_indian_delivery || 0,
        free_international_delivery: data.free_international_delivery || 0,
        allow_orders: data.allow_orders ?? true,
      });
    }
  }, [deliveryDoc]);

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

  // Check for free delivery and update delivery cost when address changes or discounted total changes
  useEffect(() => {
    if (!deliveryAddress) {
      setDeliveryCost(0);
      setIsFreeDelivery(false);
      setAmountAwayFromFreeDelivery(0);
      setFreeDeliveryEligible(false);
      return;
    }

    // Check if the delivery address is in India
    const isIndianAddress = deliveryAddress.country === "IN";

    // Get appropriate threshold for free delivery based on address location
    const freeDeliveryThreshold = isIndianAddress
      ? deliveryRates.free_indian_delivery
      : deliveryRates.free_international_delivery;

    // Check if free delivery is available for this location
    setFreeDeliveryEligible(freeDeliveryThreshold > 0);

    // Check if the order qualifies for free delivery
    const qualifiesForFreeDelivery =
      freeDeliveryThreshold > 0 && discountedTotal >= freeDeliveryThreshold;

    // Calculate how much more they need to spend for free delivery
    if (freeDeliveryThreshold > 0 && discountedTotal < freeDeliveryThreshold) {
      const amountAway = freeDeliveryThreshold - discountedTotal;
      setAmountAwayFromFreeDelivery(amountAway);
    } else {
      setAmountAwayFromFreeDelivery(0);
    }

    setIsFreeDelivery(qualifiesForFreeDelivery);

    // Set delivery cost based on whether free delivery applies
    if (qualifiesForFreeDelivery) {
      setDeliveryCost(0);
      console.log(
        `Free delivery applied (${
          isIndianAddress ? "Indian" : "International"
        })`
      );
    } else {
      // Standard delivery cost
      const cost = isIndianAddress
        ? deliveryRates.indian_delivery_cost
        : deliveryRates.international_delivery_cost;

      setDeliveryCost(cost);
      console.log(
        `Delivery cost set to ${cost} (${
          isIndianAddress ? "Indian" : "International"
        })`
      );
    }
  }, [deliveryAddress, deliveryRates, discountedTotal]);

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
    setIsFreeDelivery(false);
    setAmountAwayFromFreeDelivery(0);
    setFreeDeliveryEligible(false);
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
    isFreeDelivery,
    amountAwayFromFreeDelivery,
    freeDeliveryEligible,
    finalTotal,
    addItemsToCheckout,
    clearCheckout,
    updateDeliveryAddress,
    allowOrders: deliveryRates.allow_orders,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
