import React, { useState, useEffect } from "react";
import { FaFilter, FaChevronRight } from "react-icons/fa";
import { useFilterContext } from "../context/filter/filter_context";
import { formatPrice } from "../utils/helper";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust based on your firebase config

const Sidebar_Filter = () => {
  const {
    filters: { categoryId, min_price, max_price, price_range },
    updateFilters,
    clearFilters,
  } = useFilterContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local state for filter values before applying
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

    // Close sidebar after applying filters
    closeSidebar();
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Reset filters and local state
  const handleClearFilters = () => {
    clearFilters();
    setLocalFilters({
      categoryId: "",
      min_price: null,
      max_price: null,
    });
  };

  // Toggle body overflow when sidebar is open
  useEffect(() => {
    if (isSidebarOpen === true) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSidebarOpen]);

  return (
    <>
      <aside
        className={`z-50 lg:hidden ${
          isSidebarOpen
            ? "transition-all delay-150 duration-200 ease-out"
            : "translate-x-full transform transition-all delay-150 duration-300 ease-out"
        } fixed top-0 right-0 h-full w-10/12 bg-white shadow-md md:w-1/2`}
      >
        <section className="scrollbar-hide h-full space-y-8 overflow-y-auto p-8 font-light">
          <div className="flex justify-between">
            <h2 className="text-xl uppercase">Filter by</h2>
            <button
              className="text-sm capitalize text-primary"
              onClick={() => {
                handleClearFilters();
                closeSidebar();
              }}
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
              className="w-full rounded-md border-gray-200 capitalize focus:border-primary focus:ring-1 focus:ring-primary"
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
          <div className="space-y-4">
            <h2 className="font-medium capitalize tracking-wider">
              Price Range
            </h2>

            {/* Min Price */}
            <div className="space-y-1">
              <label htmlFor="mobile-min-price" className="text-sm">
                Min Price
              </label>
              <input
                type="number"
                name="min_price"
                id="mobile-min-price"
                value={
                  localFilters.min_price === null ? "" : localFilters.min_price
                }
                onChange={handleLocalChange}
                className="w-full rounded-md border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                min="0"
                placeholder="0"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-1">
              <label htmlFor="mobile-max-price" className="text-sm">
                Max Price
              </label>
              <input
                type="number"
                name="max_price"
                id="mobile-max-price"
                value={
                  localFilters.max_price === null ? "" : localFilters.max_price
                }
                onChange={handleLocalChange}
                className="w-full rounded-md border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                min="0"
                placeholder="Max"
              />
            </div>

            {/* Price summary and reset */}
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
            className="w-full rounded bg-primary py-2 text-white transition hover:bg-primary/90"
          >
            Apply Filters
          </button>
        </section>

        {/* Filter toggle button */}
        <div className="absolute inset-y-1/2 -left-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-black px-3 py-3 hover:bg-primary"
            aria-label={isSidebarOpen ? "Close filters" : "Open filters"}
          >
            {isSidebarOpen ? (
              <FaChevronRight className="fill-white" />
            ) : (
              <FaFilter className="fill-white" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar_Filter;
