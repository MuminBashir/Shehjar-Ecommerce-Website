import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/checkout/checkout_context";
import { useAuth } from "../../context/auth/auth_context";
import { toast } from "react-toastify";
import { FiCheck, FiPlus } from "react-icons/fi";
import AddressForm from "./_components/AddressForm";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

// Get API base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Checkout = () => {
  const navigate = useNavigate();
  const {
    checkoutItems,
    loading: checkoutLoading,
    updateDeliveryAddress,
    subtotal,
    discountedTotal,
    totalSavings,
    deliveryCost,
    finalTotal,
    isFreeDelivery,
    amountAwayFromFreeDelivery,
    freeDeliveryEligible,
    allowOrders,
  } = useCheckout();
  const { currentUser } = useAuth();

  // States
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Load addresses and set default
  useEffect(() => {
    if (currentUser && currentUser.addresses) {
      setAddresses(currentUser.addresses);
      window.scrollTo(0, 0);
      // Only set default address if no address is currently selected
      if (!selectedAddressId) {
        // Find default address if exists
        const defaultAddress = currentUser.addresses.find(
          (addr) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          updateDeliveryAddress(defaultAddress);
        } else if (currentUser.addresses.length > 0) {
          // If no default, use the first address
          setSelectedAddressId(currentUser.addresses[0].id);
          updateDeliveryAddress(currentUser.addresses[0]);
        }
      }

      setPageLoading(false);
    } else {
      setPageLoading(false);
    }
  }, [currentUser, updateDeliveryAddress, selectedAddressId]);

  // Redirect if no items in checkout
  useEffect(() => {
    if (!checkoutLoading && checkoutItems.length === 0) {
      toast.error("Please select items to checkout first");
      navigate("/cart");
    }
  }, [checkoutItems, checkoutLoading, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = async () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    // Set the selected address ID regardless of previous state
    setSelectedAddressId(addressId);

    // Find and update the selected address in checkout context
    const selectedAddress = addresses.find((addr) => addr.id === addressId);
    if (selectedAddress) {
      updateDeliveryAddress(selectedAddress);
    }
  };

  // Handle continuation to the next step
  const handleContinue = () => {
    if (!selectedAddressId && !isAddingNewAddress) {
      toast.error("Please select an address or add a new one");
      return;
    }
    window.scrollTo(0, 0);
    setStep(step + 1);
  };

  // Save a new address
  const handleSaveAddress = async (newAddress) => {
    try {
      // Generate unique ID for the address
      const addressId = Date.now().toString();
      const formattedAddress = {
        ...newAddress,
        id: addressId,
      };

      // If this is set as default, update other addresses
      let updatedAddresses;
      if (formattedAddress.isDefault) {
        updatedAddresses = addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
        updatedAddresses.push(formattedAddress);
      } else {
        updatedAddresses = [...addresses, formattedAddress];
      }

      // Update addresses in state and context
      setAddresses(updatedAddresses);
      setSelectedAddressId(addressId);
      updateDeliveryAddress(formattedAddress);

      // Update in Firebase
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          addresses: updatedAddresses,
        });
        toast.success("Address added successfully!");
      }

      setIsAddingNewAddress(false);
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    }
  };

  // Cancel adding new address
  const handleCancelAddAddress = () => {
    setIsAddingNewAddress(false);
  };

  // NEW FUNCTION: Update product quantities in inventory
  const updateProductInventory = async (orderItems) => {
    try {
      console.log("Updating product inventory for completed order...");

      // Process each item in the order
      for (const item of orderItems) {
        const { product_id, color, size, quantity } = item;

        // Get the product document
        const productRef = doc(db, "products", product_id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          console.error(`Product ${product_id} not found in database`);
          continue;
        }

        const productData = productSnap.data();
        const combinations = [...(productData.combinations || [])];

        // Find the matching combination by color and size
        const combinationIndex = combinations.findIndex(
          (combo) => combo.color === color && combo.size === size
        );

        if (combinationIndex === -1) {
          console.error(
            `Combination for ${color}/${size} not found in product ${product_id}`
          );
          continue;
        }

        // Update the quantity, ensuring it doesn't go below 0
        const newQuantity = Math.max(
          0,
          combinations[combinationIndex].quantity - quantity
        );
        combinations[combinationIndex].quantity = newQuantity;

        console.log(
          `Updating product ${product_id} ${color}/${size} from ${
            combinations[combinationIndex].quantity + quantity
          } to ${newQuantity}`
        );

        // Update the product document in Firestore
        await updateDoc(productRef, {
          combinations: combinations,
        });
      }

      console.log("Product inventory successfully updated");
    } catch (error) {
      console.error("Error updating product inventory:", error);
      // We'll continue with the order process even if inventory update fails
      // But we'll log the error for debugging
    }
  };

  // Create order in Firebase
  const createOrder = async (paymentId, paymentStatus) => {
    try {
      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );

      const orderData = {
        userId: currentUser.uid,
        items: checkoutItems,
        deliveryAddress: selectedAddress,
        payment: {
          id: paymentId,
          status: paymentStatus,
          amount: finalTotal,
          currency: "INR",
          method: "Razorpay",
        },
        subtotal,
        discount: totalSavings,
        deliveryCost,
        isFreeDelivery,
        total: finalTotal,
        status: "processing",
        createdAt: serverTimestamp(),
      };

      // Create the order document
      const orderRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = orderRef.id;

      // Update the user's orders array in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        orders: arrayUnion(orderId),
      });

      return orderId;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  // Handle Razorpay payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      // Get selected address
      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );

      if (!selectedAddress) {
        toast.error("Please select a delivery address");
        setPaymentLoading(false);
        return;
      }

      if (!allowOrders) {
        toast.error(
          "Orders are currently not being accepted. Please try again later."
        );
        setPaymentLoading(false);
        return;
      }

      // Create order on your server and get Razorpay order ID
      const response = await fetch(
        `${API_BASE_URL}/api/create-razorpay-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalTotal * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            userId: currentUser.uid,
            items: checkoutItems,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();

      if (!window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Please try again later.");
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: finalTotal * 100,
        currency: "INR",
        name: "Your E-commerce Store",
        description: "Purchase from Your E-commerce Store",
        order_id: orderData.id,
        prefill: {
          name: selectedAddress.fullName,
          email: currentUser.email,
          contact: selectedAddress.phone,
        },
        notes: {
          address: `${selectedAddress.street}, ${selectedAddress.city}, ${
            selectedAddress.stateName || selectedAddress.state
          } - ${selectedAddress.zipCode}`,
        },
        theme: {
          color: "#3399cc", // Match your primary color
        },
        handler: async function (response) {
          try {
            // Verify payment on your server
            const verificationResponse = await fetch(
              `${API_BASE_URL}/api/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (!verificationResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verificationData = await verificationResponse.json();

            if (verificationData.verified) {
              // Payment successful, create order in Firebase
              const orderId = await createOrder(
                response.razorpay_payment_id,
                "completed"
              );

              console.log(
                "Order created successfully, now updating inventory..."
              );

              // NEW: Update product inventory
              await updateProductInventory(checkoutItems);

              console.log("Inventory updated, now removing items from cart");
              if (currentUser) {
                // Remove from Firebase cart (for signed in user)
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  const currentCart = userData.cart || [];
                  const itemsToRemove = checkoutItems.map(
                    (item) =>
                      `${item.product_id}|||${item.size}|||${item.color}`
                  );
                  const updatedCart = currentCart.filter(
                    (cartItem) =>
                      !itemsToRemove.includes(
                        `${cartItem.product_id}|||${cartItem.size}|||${cartItem.color}`
                      )
                  );
                  await updateDoc(userRef, { cart: updatedCart });
                }
              } else {
                // Remove from localStorage cart (for guest user)
                const existingCart = JSON.parse(
                  localStorage.getItem("cart") || "[]"
                );
                const itemsToRemove = checkoutItems.map(
                  (item) => `${item.product_id}|||${item.size}|||${item.color}`
                );
                const updatedCart = existingCart.filter(
                  (cartItem) =>
                    !itemsToRemove.includes(
                      `${cartItem.product_id}|||${cartItem.size}|||${cartItem.color}`
                    )
                );
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                setCartItems(updatedCart);
              }

              console.log("All items removed from cart successfully");

              toast.success("Payment successful! Order has been placed.");
              navigate(`/order-success/${orderId}`);
              try {
                await fetch(`${API_BASE_URL}/api/order-notifications`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: orderId,
                    notificationType: "order-confirmation",
                  }),
                });
              } catch (e) {
                // Notification failure is non-blocking for now
                console.error("Failed to send order notification", e);
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
      setPaymentLoading(false);
    }
  };

  if (pageLoading || checkoutLoading) {
    return (
      <div className="container mx-auto mt-32 max-w-screen-xl px-4 py-8 md:mt-28">
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Get the selected address object
  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId
  );

  return (
    <div className="container mx-auto mt-32 max-w-screen-xl px-4 py-8 md:mt-28">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 1 ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            1
          </div>
          <div
            className={`h-1 w-16 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}
          ></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= 2 ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            2
          </div>
        </div>
        <div className="mt-2 flex justify-center text-sm">
          <div className="w-24 text-center">Delivery Address</div>
          <div className="w-24 text-center">Review & Payment</div>
        </div>
      </div>

      {/* Step 1: Address Selection */}
      {step === 1 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Select Delivery Address
          </h2>

          {addresses.length === 0 && !isAddingNewAddress ? (
            <div className="mb-4 rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-gray-600">
                You don't have any saved addresses.
              </p>
              <button
                onClick={() => setIsAddingNewAddress(true)}
                className="mt-2 text-primary hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            !isAddingNewAddress && (
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address.id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedAddressId === address.id
                        ? "border-primary bg-primary bg-opacity-5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{address.name}</h3>
                        {address.isDefault && (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                      {selectedAddressId === address.id && (
                        <div className="rounded-full bg-primary p-1 text-white">
                          <FiCheck size={14} />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700">{address.fullName}</p>
                    <p className="text-gray-700">{address.street}</p>
                    <p className="text-gray-700">
                      {address.city}, {address.stateName || address.state}{" "}
                      {address.zipCode}
                    </p>
                    <p className="text-gray-700">
                      {address.countryName || address.country}
                    </p>
                    <p className="mt-1 text-gray-700">Phone: {address.phone}</p>
                  </div>
                ))}

                {/* Add New Address Button */}
                <div
                  onClick={() => setIsAddingNewAddress(true)}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center hover:border-primary"
                >
                  <div className="mb-2 rounded-full bg-gray-100 p-3">
                    <FiPlus size={20} className="text-gray-600" />
                  </div>
                  <p className="text-gray-600">Add a new address</p>
                </div>
              </div>
            )
          )}

          {/* New Address Form */}
          {isAddingNewAddress && (
            <AddressForm
              onSave={handleSaveAddress}
              onCancel={handleCancelAddAddress}
            />
          )}

          {/* Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => navigate("/cart")}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Back to Cart
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedAddressId && !isAddingNewAddress}
              className={`hover:bg-primary-dark rounded bg-primary px-4 py-2 text-white transition-colors ${
                !selectedAddressId && !isAddingNewAddress
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review & Payment */}
      {step === 2 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">Review & Payment</h2>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left Side: Checkout Items */}
            <div className="flex-1">
              <h3 className="mb-4 font-medium">Order Items</h3>
              <div className="divide-y">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="flex py-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            Color: {item.color} | Size: {item.size}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          {item.isOnSale ? (
                            <>
                              <p className="text-sm font-semibold text-gray-900">
                                ₹{item.discountedPrice * item.quantity}
                              </p>
                              <p className="text-xs text-gray-500 line-through">
                                ₹{item.price * item.quantity}
                              </p>
                              <p className="text-xs text-green-600">
                                -{item.discountPercentage}%
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              ₹{item.price * item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="w-full lg:w-72">
              <h3 className="mb-4 font-medium">Order Summary</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <p>Subtotal</p>
                    <p>₹{subtotal}</p>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <p>Discount</p>
                      <p>-₹{totalSavings}</p>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <p>Delivery</p>
                    {isFreeDelivery ? (
                      <p className="text-green-600">Free</p>
                    ) : (
                      <p>₹{deliveryCost}</p>
                    )}
                  </div>
                  {isFreeDelivery && (
                    <div className="text-xs italic text-green-600">
                      Free delivery applied to your order!
                    </div>
                  )}
                  {!isFreeDelivery &&
                    freeDeliveryEligible &&
                    amountAwayFromFreeDelivery > 0 && (
                      <div className="text-xs italic text-gray-500">
                        Add ₹{amountAwayFromFreeDelivery.toLocaleString()} more
                        to qualify for free delivery!
                      </div>
                    )}
                  <div className="border-t border-gray-200 pt-2"></div>
                  <div className="flex justify-between font-semibold">
                    <p>Total</p>
                    <p>₹{finalTotal}</p>
                  </div>
                </div>
              </div>

              {/* Selected Address */}
              {selectedAddress && (
                <div className="mt-6">
                  <h3 className="mb-2 font-medium">Delivery Address</h3>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="font-semibold">{selectedAddress.fullName}</p>
                    <p className="text-sm text-gray-700">
                      {selectedAddress.street}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedAddress.city},{" "}
                      {selectedAddress.stateName || selectedAddress.state}{" "}
                      {selectedAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedAddress.countryName || selectedAddress.country}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      Phone: {selectedAddress.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className={`hover:bg-primary-dark mt-6 w-full rounded bg-primary py-3 text-white transition-colors ${
                  paymentLoading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {paymentLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  "Pay & Place Order"
                )}
              </button>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                setStep(1);
                window.scrollTo(0, 0);
              }}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Back to Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
