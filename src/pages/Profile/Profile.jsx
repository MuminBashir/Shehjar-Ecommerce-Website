import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/auth/auth_context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} from "libphonenumber-js";
// Import the country-state-city library which has more comprehensive data
import { Country, State } from "country-state-city";

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [stateOptions, setStateOptions] = useState([]);

  // Get countries list using country-state-city library
  const countries = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
  }, []);

  // Form validation schema
  const addressSchema = z.object({
    name: z.string().min(1, "Address name is required"),
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone number is required"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .nullable()
      .optional(),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z
      .object({
        value: z.string(),
        label: z.string(),
      })
      .nullable(),
    isDefault: z.boolean(),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: null,
      zipCode: "",
      country: null,
      isDefault: false,
    },
  });

  // Watch the country field to update states
  const watchedCountry = watch("country");

  // Update states/provinces when country changes
  useEffect(() => {
    if (watchedCountry && watchedCountry.value) {
      const states = State.getStatesOfCountry(watchedCountry.value);
      setStateOptions(
        states.map((state) => ({
          value: state.isoCode,
          label: state.name,
        }))
      );
    } else {
      setStateOptions([]);
    }
  }, [watchedCountry]);

  // Load addresses when component mounts
  useEffect(() => {
    if (currentUser && currentUser.addresses) {
      setAddresses(currentUser.addresses);
    } else {
      setAddresses([]);
    }
  }, [currentUser]);

  const resetAddressForm = () => {
    reset();
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    setEditIndex(null);
  };

  const formatPhoneNumber = (phoneNumber, countryCode) => {
    try {
      const parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
      return parsedNumber ? parsedNumber.formatInternational() : phoneNumber;
    } catch (error) {
      return phoneNumber;
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      // Format the data for storage
      const formattedAddress = {
        ...data,
        state: data.state?.value || "",
        stateName: data.state?.label || "",
        country: data.country?.value || "",
        countryName: data.country?.label || "",
        phone: data.country?.value
          ? formatPhoneNumber(data.phone, data.country.value)
          : data.phone,
        id: isEditingAddress ? addresses[editIndex].id : Date.now().toString(),
      };

      let updatedAddresses = [...addresses];

      // If address is default, make sure all others are not default
      if (formattedAddress.isDefault) {
        updatedAddresses = updatedAddresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));
      }

      if (isEditingAddress) {
        // Update existing address
        updatedAddresses[editIndex] = formattedAddress;
      } else {
        // Add new address
        updatedAddresses.push(formattedAddress);
      }

      // Update Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        addresses: updatedAddresses,
      });

      // Update local state
      setAddresses(updatedAddresses);
      resetAddressForm();
      toast.success(
        `Address ${isEditingAddress ? "updated" : "added"} successfully!`
      );
    } catch (error) {
      console.error(
        `Error ${isEditingAddress ? "updating" : "adding"} address:`,
        error
      );
      toast.error(
        `Failed to ${
          isEditingAddress ? "update" : "add"
        } address. Please try again.`
      );
    }
  };

  const handleEditAddress = (index) => {
    window.scrollTo({ top: 100, behavior: "smooth" });
    const address = addresses[index];
    setIsEditingAddress(true);
    setEditIndex(index);

    // Find country and state objects from their values
    const countryObj =
      countries.find((c) => c.value === address.country) ||
      countries.find((c) => c.label === address.countryName);

    // Set form values
    reset({
      name: address.name || "",
      fullName: address.fullName || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: null, // Will be set after country selection triggers state options
      zipCode: address.zipCode || "",
      country: countryObj,
      isDefault: address.isDefault || false,
    });

    // If we have country and state info, set state after state options are loaded
    if (countryObj) {
      setTimeout(() => {
        const states = State.getStatesOfCountry(countryObj.value);
        const statesList = states.map((state) => ({
          value: state.isoCode,
          label: state.name,
        }));

        const stateObj =
          statesList.find((s) => s.value === address.state) ||
          statesList.find((s) => s.label === address.stateName);

        if (stateObj) {
          setValue("state", stateObj);
        }
      }, 100);
    }
  };

  // Show delete confirmation dialog
  const confirmDeleteAddress = (index) => {
    setAddressToDelete(index);
    setShowDeleteConfirm(true);
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAddressToDelete(null);
  };

  // Perform the actual delete after confirmation
  const handleDeleteAddress = async () => {
    try {
      const updatedAddresses = addresses.filter(
        (_, i) => i !== addressToDelete
      );

      // Update Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        addresses: updatedAddresses,
      });

      // Update local state
      setAddresses(updatedAddresses);
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-20 max-w-screen-xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar / Tabs */}
        <div className="md:w-1/4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-6 flex items-center space-x-4">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User"}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-xl font-bold text-gray-600">
                    {currentUser.displayName?.charAt(0) ||
                      currentUser.email?.charAt(0) ||
                      "U"}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-bold">
                  {currentUser.displayName || "User"}
                </h2>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
              </div>
            </div>

            <nav>
              <button
                className={`mb-2 w-full rounded py-2 px-4 text-left ${
                  activeTab === "profile"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Information
              </button>
              <button
                className={`w-full rounded py-2 px-4 text-left ${
                  activeTab === "addresses"
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("addresses")}
              >
                Addresses
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="rounded-lg bg-white p-6 shadow">
            {activeTab === "profile" && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Profile Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-gray-700">Name</label>
                    <p className="rounded-md border border-gray-300 bg-gray-50 py-2 px-3">
                      {currentUser.displayName || "Not set"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Name cannot be changed here. It's managed through your
                      Google account.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-gray-700">Email</label>
                    <p className="rounded-md border border-gray-300 bg-gray-50 py-2 px-3">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">My Addresses</h2>
                  {!isAddingAddress && !isEditingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="hover:bg-primary-dark flex items-center rounded bg-primary px-3 py-1 text-sm text-white transition-colors"
                    >
                      <FiPlusCircle className="mr-1" /> Add New Address
                    </button>
                  )}
                </div>

                {/* Address Form */}
                {(isAddingAddress || isEditingAddress) && (
                  <form
                    onSubmit={handleSubmit(onAddressSubmit)}
                    className="mb-6 rounded-lg border p-4"
                  >
                    <h3 className="mb-4 text-lg font-semibold">
                      {isEditingAddress ? "Update Address" : "Add New Address"}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-gray-700">
                          Address Name*
                        </label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="Home, Office, etc."
                              className="w-full rounded-md border border-gray-300 py-2 px-3"
                            />
                          )}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-gray-700">
                          Full Name*
                        </label>
                        <Controller
                          name="fullName"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="John Doe"
                              className="w-full rounded-md border border-gray-300 py-2 px-3"
                            />
                          )}
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-gray-700">
                          Country*
                        </label>
                        <Controller
                          name="country"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={countries}
                              placeholder="Select Country"
                              className="w-full"
                              classNamePrefix="react-select"
                            />
                          )}
                        />
                        {errors.country && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.country.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-gray-700">
                          Phone Number*
                        </label>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              placeholder="+1 (123) 456-7890"
                              className="w-full rounded-md border border-gray-300 py-2 px-3"
                            />
                          )}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-gray-700">
                          Street Address*
                        </label>
                        <Controller
                          name="street"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="123 Main St, Apt 4B"
                              className="w-full rounded-md border border-gray-300 py-2 px-3"
                            />
                          )}
                        />
                        {errors.street && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.street.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-gray-700">
                          City*
                        </label>
                        <Controller
                          name="city"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="New York"
                              className="w-full rounded-md border border-gray-300 py-2 px-3"
                            />
                          )}
                        />
                        {errors.city && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-gray-700">
                          State/Province
                        </label>
                        <Controller
                          name="state"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={stateOptions}
                              isDisabled={
                                !watchedCountry || stateOptions.length === 0
                              }
                              placeholder={
                                !watchedCountry
                                  ? "Select country first"
                                  : stateOptions.length === 0
                                  ? "No states available for this country"
                                  : "Select State/Province"
                              }
                              className="w-full"
                              classNamePrefix="react-select"
                              isClearable
                            />
                          )}
                        />
                        {errors.state && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-gray-700">
                          Zip/Postal Code*
                        </label>
                        <Controller
                          name="zipCode"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="10001"
                              className="w-full rounded-md border border-gray-300 py-2 px-3"
                            />
                          )}
                        />
                        {errors.zipCode && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Controller
                          name="isDefault"
                          control={control}
                          render={({ field }) => (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mr-2"
                              />
                              <span className="text-gray-700">
                                Set as default address
                              </span>
                            </label>
                          )}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="submit"
                        className="hover:bg-primary-dark rounded bg-primary px-4 py-2 text-white transition-colors"
                      >
                        {isEditingAddress ? "Update Address" : "Save Address"}
                      </button>
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Address List */}
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address, index) => (
                      <div
                        key={address.id || index}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{address.name}</h3>
                            {address.isDefault && (
                              <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(index)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label="Edit address"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => confirmDeleteAddress(index)}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete address"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
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
                        <p className="mt-1 text-gray-700">
                          Phone: {address.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-gray-50 py-8 text-center">
                    <p className="text-gray-500">
                      You haven't added any addresses yet.
                    </p>
                    {!isAddingAddress && (
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="mt-2 text-primary hover:underline"
                      >
                        Add your first address
                      </button>
                    )}
                  </div>
                )}

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                      <h3 className="mb-3 text-lg font-semibold">
                        Confirm Deletion
                      </h3>
                      <p className="mb-4 text-gray-700">
                        Are you sure you want to delete this address? This
                        action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={cancelDelete}
                          className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAddress}
                          className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
