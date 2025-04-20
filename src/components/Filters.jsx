import React, { useEffect, useState } from "react";
import { useFilterContext } from "../context/filter/filter_context";
import { formatPrice } from "../utils/helper";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust this import based on your firebase config

const Filters = () => {
  const {
    filters: { categoryId, min_price, max_price, price_range },
    updateFilters,
    clearFilters,
  } = useFilterContext();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local state to store filter values before applying
  const [localFilters, setLocalFilters] = useState({
    categoryId: categoryId,
    min_price: min_price,
    max_price: max_price,
  });

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          category_name: doc.data().category_name,
        }));
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Update local state when filters change
  useEffect(() => {
    setLocalFilters({
      categoryId,
      min_price,
      max_price,
    });
  }, [categoryId, min_price, max_price]);

  // Handle local filter changes
  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };

  // Apply filters to the context
  const applyFilters = () => {
    // Apply category filter
    updateFilters({
      target: {
        name: "categoryId",
        value: localFilters.categoryId,
      },
    });

    // Apply min price filter if it has changed
    if (localFilters.min_price !== min_price) {
      updateFilters({
        target: {
          name: "min_price",
          value:
            localFilters.min_price === ""
              ? null
              : Number(localFilters.min_price),
        },
      });
    }

    // Apply max price filter if it has changed
    if (localFilters.max_price !== max_price) {
      updateFilters({
        target: {
          name: "max_price",
          value:
            localFilters.max_price === ""
              ? null
              : Number(localFilters.max_price),
        },
      });
    }
  };

  // Reset local filters
  const handleClearFilters = () => {
    clearFilters();
    setLocalFilters({
      categoryId: "",
      min_price: null,
      max_price: null,
    });
  };

  return (
    <aside className="sticky top-0 hidden h-full w-1/3 flex-col space-y-8 border p-8 font-light lg:flex">
      <div className="flex justify-between">
        <h2 className="text-2xl uppercase">Filter by</h2>
        <button
          className="text-sm capitalize text-primary"
          onClick={handleClearFilters}
        >
          Clear all
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h2 className="font-medium capitalize tracking-wider">Category</h2>
        <select
          name="categoryId"
          value={localFilters.categoryId}
          onChange={handleLocalChange}
          className="w-full rounded-md border-gray-200 capitalize focus:border-primary focus:ring-0"
          disabled={loading}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
        {loading && (
          <p className="text-sm text-gray-500">Loading categories...</p>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <h2 className="font-medium capitalize tracking-wider">Price Range</h2>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="min_price" className="text-sm">
              Min Price
            </label>
            <input
              type="number"
              name="min_price"
              id="min_price"
              value={
                localFilters.min_price === null ? "" : localFilters.min_price
              }
              onChange={handleLocalChange}
              className="w-full rounded-md border-gray-200 focus:border-primary focus:ring-0"
              min="0"
              placeholder="0"
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="max_price" className="text-sm">
              Max Price
            </label>
            <input
              type="number"
              name="max_price"
              id="max_price"
              value={
                localFilters.max_price === null ? "" : localFilters.max_price
              }
              className="w-full rounded-md border-gray-200 focus:border-primary focus:ring-0"
              onChange={handleLocalChange}
              min="0"
              placeholder="Max"
            />
          </div>
        </div>
        {price_range && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {min_price !== null ? formatPrice(min_price) : "$0"} -{" "}
              {max_price !== null ? formatPrice(max_price) : "Any"}
            </p>
            <button
              onClick={() => {
                updateFilters({
                  target: {
                    name: "clear_price",
                    value: true,
                  },
                });
                setLocalFilters({
                  ...localFilters,
                  min_price: null,
                  max_price: null,
                });
              }}
              className="text-xs text-primary"
            >
              Reset price
            </button>
          </div>
        )}
      </div>

      {/* Apply filters button */}
      <button
        onClick={applyFilters}
        className="mt-4 w-full rounded-md bg-primary py-2 font-medium text-white transition duration-200 hover:bg-primary/90"
      >
        Apply Filters
      </button>
    </aside>
  );
};

export default Filters;
