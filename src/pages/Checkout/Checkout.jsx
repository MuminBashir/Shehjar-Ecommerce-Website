import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/checkout/checkout_context";
import { useAuth } from "../../context/auth/auth_context";
import { useCart } from "../../context/cart/cart_context";
import { toast } from "react-toastify";
import { FiCheck, FiPlus } from "react-icons/fi";
import AddressForm from "./_components/AddressForm";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

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
  } = useCheckout();
  const { currentUser } = useAuth();
  const { clearCart } = useCart();

  // States
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Load addresses and set default
  useEffect(() => {
    if (currentUser && currentUser.addresses) {
      setAddresses(currentUser.addresses);

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

  // Handle place order
  const handlePlaceOrder = async () => {
    toast.success("Order has been placed successfully!");
    await clearCart();
    navigate("/");
    window.scrollTo(0, 0);
  };

  if (pageLoading || checkoutLoading) {
    return (
      <div className="container mx-auto mt-20 max-w-screen-xl px-4 py-8">
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
    <div className="container mx-auto mt-20 max-w-screen-xl px-4 py-8">
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
              Continue to Review & Payment
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
                    <p>₹{deliveryCost}</p>
                  </div>
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
                onClick={handlePlaceOrder}
                className="hover:bg-primary-dark mt-6 w-full rounded bg-primary py-3 text-white transition-colors"
              >
                Place Order
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
