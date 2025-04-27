import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth_context";
import { useCart } from "../../context/cart/cart_context";
import { useSale } from "../../context/sale/sale_context";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { toast } from "react-toastify";
import { IndianRupee, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Country, State } from "country-state-city";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Select from "react-select";

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const { currentSale, hasActiveSale } = useSale();
  const navigate = useNavigate();

  const [products, setProducts] = useState({});
  const [step, setStep] = useState(1); // 1 for address, 2 for payment
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: null,
    zipCode: "",
    country: null,
  });
  const [visibleAddresses, setVisibleAddresses] = useState([]);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [deliveryCost, setDeliveryCost] = useState(0);

  // Get countries list using country-state-city library
  const countries = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
  }, []);

  // Fetch all products once
  const productsQuery = query(collection(db, "products"));
  const [productsData, productsLoading] = useCollectionData(productsQuery);

  const deliveryDocRef = doc(db, "delivery", "current_delivery");
  const [deliveryData, deliveryLoading] = useDocumentData(deliveryDocRef);

  // Set up products map when data loads
  useEffect(() => {
    if (productsData) {
      const productsMap = {};
      productsData.forEach((product) => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    }
  }, [productsData]);

  // Select default address when user data is available
  useEffect(() => {
    if (
      currentUser &&
      currentUser.addresses &&
      currentUser.addresses.length > 0
    ) {
      const defaultAddress =
        currentUser.addresses.find((addr) => addr.isDefault) ||
        currentUser.addresses[0];
      setSelectedAddress(defaultAddress);
      setVisibleAddresses([...currentUser.addresses]);
    }
  }, [currentUser]);

  // Calculate totals when necessary data is loaded
  useEffect(() => {
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
      setDiscountedTotal(discounted + deliveryCost); // Add delivery cost to discounted total
      setTotalSavings(original - discounted);
    } else {
      setOriginalTotal(0);
      setDiscountedTotal(0);
      setTotalSavings(0);
    }

    setLoading(cartLoading || productsLoading || deliveryLoading);
  }, [
    cartItems,
    products,
    cartLoading,
    productsLoading,
    hasActiveSale,
    currentSale,
    deliveryCost,
    deliveryLoading,
  ]);

  // Watch for country changes
  useEffect(() => {
    if (newAddress.country) {
      const states = State.getStatesOfCountry(newAddress.country.value);
      setStateOptions(
        states.map((state) => ({
          value: state.isoCode,
          label: state.name,
        }))
      );
    } else {
      setStateOptions([]);
    }
  }, [newAddress.country]);

  //  useEffect to calculate delivery cost based on the selected address
  useEffect(() => {
    if (deliveryData && selectedAddress) {
      // Check if the selected address is in India
      const isIndian = isIndianAddress();

      // Set the appropriate delivery cost
      if (isIndian) {
        setDeliveryCost(deliveryData.indian_delivery_cost || 0);
      } else {
        setDeliveryCost(deliveryData.international_delivery_cost || 0);
      }
    } else {
      setDeliveryCost(0);
    }
  }, [deliveryData, selectedAddress]);

  const isIndianAddress = () => {
    return (
      selectedAddress.country === "IN" ||
      selectedAddress.countryName === "India" ||
      selectedAddress.country?.value === "IN"
    );
  };

  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setNewAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowNewAddressForm(false);
  };

  // Add address to Firestore
  const addAddressToFirestore = async (address) => {
    try {
      if (!currentUser || !currentUser.uid) {
        toast.error("User information not available");
        return null;
      }

      // Format address data
      const formattedAddress = {
        ...address,
        state: address.state?.value || "",
        stateName: address.state?.label || "",
        country: address.country?.value || "",
        countryName: address.country?.label || "",
        phone: address.country?.value
          ? formatPhoneNumber(address.phone, address.country.value)
          : address.phone,
        id: `address-${Date.now()}`,
      };

      // Get the user document reference
      const userDocRef = doc(db, "users", currentUser.uid);

      // Get the current user document
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Update the existing user document with the new address
        await updateDoc(userDocRef, {
          addresses: arrayUnion(formattedAddress),
        });

        return formattedAddress;
      } else {
        toast.error("User document not found");
        return null;
      }
    } catch (error) {
      console.error("Error adding address to Firestore:", error);
      toast.error("Failed to save address");
      return null;
    }
  };

  const formatPhoneNumber = (phoneNumber, countryCode) => {
    try {
      const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
      return parsedNumber ? parsedNumber.formatInternational() : phoneNumber;
    } catch (error) {
      return phoneNumber;
    }
  };

  // Create new address - FIXED to prevent duplicate addresses
  const handleAddNewAddress = async (e) => {
    e.preventDefault();

    if (
      !newAddress.name ||
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode ||
      !newAddress.country
    ) {
      toast.error("Please fill all the address fields");
      return;
    }

    setIsAddingAddress(true);

    try {
      // Create a unique ID for the new address
      const addressId = `address-${Date.now()}`;
      const addressData = {
        ...newAddress,
        id: addressId,
        isDefault: false, // New addresses are not default by default
      };

      // Add to Firestore
      const savedAddress = await addAddressToFirestore(addressData);

      if (savedAddress) {
        // Update the currentUser object with the new address - this prevents duplication
        if (!currentUser.addresses) {
          currentUser.addresses = [savedAddress];
        } else {
          // Check if address already exists in the array
          const addressExists = currentUser.addresses.some(
            (addr) => addr.id === savedAddress.id
          );
          if (!addressExists) {
            currentUser.addresses.push(savedAddress);
          }
        }

        // Set visible addresses directly from the updated currentUser object
        // This ensures we're using a single source of truth
        setVisibleAddresses([...currentUser.addresses]);

        // Select this address
        setSelectedAddress(savedAddress);
        setShowNewAddressForm(false);

        // Reset the form
        setNewAddress({
          name: "",
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        });

        toast.success("New address added successfully");
      }
    } catch (error) {
      console.error("Error in adding address:", error);
      toast.error("Failed to add address");
    } finally {
      setIsAddingAddress(false);
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (!selectedAddress) {
      toast.error("Please select or add an address to continue");
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(2);
  };

  // Move to previous step
  const handlePreviousStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(1);
  };

  // Handle checkout completion
  const handleCompleteCheckout = () => {
    setIsProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      // Clear cart after successful order
      clearCart();
      setIsProcessingPayment(false);
      toast.success("Order placed successfully!");
      navigate("/orders");
    }, 1500);
  };

  // Map cart items to include product data
  const getCartItems = () => {
    return cartItems
      .map((item) => ({ ...item, product: products[item.product_id] }))
      .filter((item) => item.product); // Only include items where we have the product data
  };

  // Redirect to cart if there are no items
  useEffect(() => {
    if (
      !cartLoading &&
      !productsLoading &&
      (!cartItems || cartItems.length === 0)
    ) {
      toast.info("Your cart is empty");
      navigate("/cart");
    }
  }, [cartItems, loading, navigate]);

  // Calculate price for a single item with discount applied if applicable
  const getItemPrice = (product, isOnSale) => {
    if (isOnSale && currentSale?.discount_percentage) {
      return Math.floor(
        product.price * (1 - currentSale.discount_percentage / 100)
      );
    }
    return product.price;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading checkout information...</div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="container mx-auto mt-20 px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-4 text-xl font-medium text-red-700">
            Login Required
          </h2>
          <p className="mb-6 text-red-600">
            You need to login before proceeding to checkout
          </p>
          <button
            onClick={() => navigate("/login")}
            className="hover:bg-primary-dark rounded-md bg-primary px-6 py-2 text-white transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-20 mb-12 px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Checkout</h1>

      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              step === 1 ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            1
          </div>
          <div className="h-1 w-16 bg-gray-200">
            <div
              className={`h-full ${step === 2 ? "bg-primary" : "bg-gray-200"}`}
            ></div>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              step === 2 ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            2
          </div>
        </div>
        <div className="mt-2 flex justify-center space-x-20">
          <span
            className={`text-sm ${
              step === 1 ? "font-medium text-primary" : "text-gray-500"
            }`}
          >
            Shipping Address
          </span>
          <span
            className={`text-sm ${
              step === 2 ? "font-medium text-primary" : "text-gray-500"
            }`}
          >
            Review & Payment
          </span>
        </div>
      </div>

      {/* Step 1: Address Selection */}
      {step === 1 && (
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-xl font-medium">Select Delivery Address</h2>

          {/* Existing Addresses */}
          {visibleAddresses.length > 0 && (
            <div className="mb-6 space-y-4">
              {visibleAddresses.map((address, index) => (
                <div
                  key={address.id || index}
                  className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
                    selectedAddress && selectedAddress.id === address.id
                      ? "bg-primary-50 border-primary"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="address"
                      className="mr-3 h-4 w-4 text-primary"
                      checked={
                        selectedAddress && selectedAddress.id === address.id
                      }
                      onChange={() => handleAddressSelect(address)}
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{address.name}</h3>
                        {address.isDefault && (
                          <span className="bg-primary-100 rounded px-2 py-1 text-xs text-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">
                        {address.fullName}
                      </p>
                      <p className="text-sm text-gray-700">{address.street}</p>
                      <p className="text-sm text-gray-700">
                        {address.city}, {address.stateName || address.state}{" "}
                        {address.zipCode}
                      </p>
                      <p className="text-sm text-gray-700">
                        {address.countryName || address.country}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        Phone: {address.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Address Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowNewAddressForm(!showNewAddressForm)}
              className="flex items-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
            >
              <Plus size={18} className="mr-2" />
              {showNewAddressForm ? "Cancel" : "Add a New Address"}
            </button>
          </div>

          {/* New Address Form */}
          {/* New Address Form */}
          {showNewAddressForm && (
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-lg font-medium">Add New Address</h3>
              <form onSubmit={handleAddNewAddress}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Address Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newAddress.name}
                      onChange={handleInputChange}
                      placeholder="Home, Work, etc."
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={newAddress.fullName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <Select
                      name="country"
                      options={countries}
                      value={newAddress.country}
                      onChange={(selectedOption) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          country: selectedOption,
                        }))
                      }
                      placeholder="Select Country"
                      className="w-full"
                      classNamePrefix="react-select"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={newAddress.street}
                      onChange={handleInputChange}
                      placeholder="Street address, house number"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      State/Province
                    </label>
                    <Select
                      name="state"
                      options={stateOptions}
                      value={newAddress.state}
                      onChange={(selectedOption) =>
                        setNewAddress((prev) => ({
                          ...prev,
                          state: selectedOption,
                        }))
                      }
                      isDisabled={
                        !newAddress.country || stateOptions.length === 0
                      }
                      placeholder={
                        !newAddress.country
                          ? "Select country first"
                          : stateOptions.length === 0
                          ? "No states available for this country"
                          : "Select State/Province"
                      }
                      className="w-full"
                      classNamePrefix="react-select"
                      isClearable
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={newAddress.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP or postal code"
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="hover:bg-primary-dark disabled:bg-primary-light rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed"
                    disabled={isAddingAddress}
                  >
                    {isAddingAddress ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back to Cart
            </button>
            <button
              onClick={handleNextStep}
              className="hover:bg-primary-dark flex items-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition-colors"
              disabled={!selectedAddress}
            >
              Continue
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Order Review & Payment */}
      {step === 2 && (
        <div className="grid gap-8 md:grid-cols-3">
          {/* Order Items (Left Side) */}
          <div className="md:col-span-2">
            <h2 className="mb-4 text-lg font-medium md:mb-6 md:text-xl">
              Order Summary
            </h2>

            <div className="space-y-3 md:space-y-4">
              {getCartItems().map((item, index) => {
                const isOnSale =
                  hasActiveSale &&
                  currentSale?.product_ids?.includes(item.product_id);
                const unitPrice = getItemPrice(item.product, isOnSale);
                const totalItemPrice = unitPrice * item.quantity;
                const originalUnitPrice = item.product.price;
                const originalTotalPrice = originalUnitPrice * item.quantity;

                return (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-3 shadow-sm md:p-4"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image - Full width on mobile, fixed width on desktop */}
                      <div className="mb-3 h-40 flex-shrink-0 sm:mb-0 sm:h-20 sm:w-20">
                        <img
                          src={item.product.thumbnail_image}
                          alt={item.product.name}
                          className="h-full w-full rounded-md object-cover"
                        />
                      </div>

                      {/* Product details - Better spacing for mobile */}
                      <div className="flex flex-grow flex-col sm:ml-4">
                        <div className="flex items-start justify-between">
                          <h3 className="md:text-md text-base font-medium">
                            {item.product.name}
                          </h3>
                        </div>

                        <div className="mt-1 text-xs text-gray-500 md:text-sm">
                          Size: {item.size} | Color: {item.color}
                        </div>

                        {/* Price and quantity info - Stacked on mobile, side by side on larger screens */}
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
                          <div className="flex items-center">
                            <span className="text-xs md:text-sm">
                              Price per item:{" "}
                            </span>
                            {isOnSale ? (
                              <div className="ml-1 flex items-center">
                                <span className="flex items-center text-red-600">
                                  <IndianRupee size={12} className="inline" />
                                  <span>{unitPrice}</span>
                                </span>
                                <span className="ml-1 flex items-center text-xs text-gray-500 line-through">
                                  <IndianRupee size={10} className="inline" />
                                  <span>{originalUnitPrice}</span>
                                </span>
                              </div>
                            ) : (
                              <span className="ml-1 flex items-center">
                                <IndianRupee size={12} className="inline" />
                                <span>{unitPrice}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center">
                            <span className="text-xs md:text-sm">
                              Quantity: {item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Total price - Right aligned */}
                        <div className="mt-2 flex items-center justify-end font-medium">
                          <span className="text-xs md:text-sm">Total: </span>
                          {isOnSale ? (
                            <div className="ml-1 flex items-center">
                              <span className="flex items-center text-red-600">
                                <IndianRupee size={12} className="inline" />
                                <span>{totalItemPrice}</span>
                              </span>
                              <span className="ml-1 flex items-center text-xs text-gray-500 line-through">
                                <IndianRupee size={10} className="inline" />
                                <span>{originalTotalPrice}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="ml-1 flex items-center">
                              <IndianRupee size={12} className="inline" />
                              <span>{totalItemPrice}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Total & Payment (Right Side) */}
          <div className="md:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium">Order Details</h2>

              {/* Price Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    <IndianRupee size={14} className="inline" />
                    {originalTotal}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>
                      - <IndianRupee size={14} className="inline" />
                      {Math.floor(totalSavings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery{" "}
                    {isIndianAddress() ? (
                      <span className="text-sm text-gray-400">
                        {"("}India{")"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {"("}International{")"}
                      </span>
                    )}
                  </span>
                  {deliveryLoading ? (
                    <span>Loading...</span>
                  ) : deliveryCost > 0 ? (
                    <span className="font-medium">
                      <IndianRupee size={14} className="inline" />
                      {deliveryCost}
                    </span>
                  ) : (
                    <span className="font-medium text-green-600">Free</span>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-bold">
                      <IndianRupee size={16} className="inline" />
                      {Math.floor(discountedTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Address */}
              {selectedAddress && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Delivering to:
                  </h3>
                  <div className="rounded-md bg-white p-3 text-sm">
                    <p className="font-medium">{selectedAddress.fullName}</p>
                    <p className="text-gray-600">{selectedAddress.street}</p>
                    <p className="text-gray-600">
                      {selectedAddress.city},{" "}
                      {selectedAddress.stateName || selectedAddress.state}{" "}
                      {selectedAddress.zipCode}
                    </p>
                    <p className="text-gray-600">
                      {selectedAddress.countryName || selectedAddress.country}
                    </p>
                    <p className="mt-1 text-gray-600">
                      Phone: {selectedAddress.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="mt-6">
                <button
                  onClick={handleCompleteCheckout}
                  disabled={isProcessingPayment}
                  className="w-full rounded-md border border-primary bg-primary py-3 font-medium text-white transition-colors hover:bg-white hover:text-primary disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isProcessingPayment ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-4">
              <button
                onClick={handlePreviousStep}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                Back to Shipping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
