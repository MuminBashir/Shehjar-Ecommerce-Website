import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import { Country, State } from "country-state-city";

const AddressForm = ({ onSave, onCancel, initialData = null }) => {
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
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: initialData?.name || "",
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      street: initialData?.street || "",
      city: initialData?.city || "",
      state: null,
      zipCode: initialData?.zipCode || "",
      country: null,
      isDefault: initialData?.isDefault || false,
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

  // Set initial values if provided
  useEffect(() => {
    if (initialData) {
      const countryObj = countries.find(
        (c) =>
          c.value === initialData.country || c.label === initialData.countryName
      );

      reset({
        name: initialData.name || "",
        fullName: initialData.fullName || "",
        phone: initialData.phone || "",
        street: initialData.street || "",
        city: initialData.city || "",
        zipCode: initialData.zipCode || "",
        country: countryObj || null,
        isDefault: initialData.isDefault || false,
      });

      // Set state after country selection has populated state options
      if (countryObj) {
        setTimeout(() => {
          const states = State.getStatesOfCountry(countryObj.value);
          const statesList = states.map((state) => ({
            value: state.isoCode,
            label: state.name,
          }));

          const stateObj = statesList.find(
            (s) =>
              s.value === initialData.state || s.label === initialData.stateName
          );

          if (stateObj) {
            reset((current) => ({
              ...current,
              state: stateObj,
            }));
          }
        }, 100);
      }
    }
  }, [initialData, countries, reset]);

  const onSubmit = (data) => {
    // Format the data for storage
    const formattedAddress = {
      ...data,
      state: data.state?.value || "",
      stateName: data.state?.label || "",
      country: data.country?.value || "",
      countryName: data.country?.label || "",
    };

    onSave(formattedAddress);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Add New Address</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-gray-700">Address Name*</label>
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
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-gray-700">Full Name*</label>
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
          <label className="mb-1 block text-gray-700">Country*</label>
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
          <label className="mb-1 block text-gray-700">Phone Number*</label>
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
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-gray-700">Street Address*</label>
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
            <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-gray-700">City*</label>
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
            <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-gray-700">State/Province</label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={stateOptions}
                isDisabled={!watchedCountry || stateOptions.length === 0}
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
            <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-gray-700">Zip/Postal Code*</label>
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
                <span className="text-gray-700">Set as default address</span>
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
          Save Address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
