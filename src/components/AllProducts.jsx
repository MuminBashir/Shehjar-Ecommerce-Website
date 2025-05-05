import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useFilterContext } from "../context/filter/filter_context";
import ProductCard from "./ProductCard";
import { FaThLarge, FaList } from "react-icons/fa";
import Pagination from "./Pagination";
import { useLocation } from "react-router-dom";
import Empty_product from "./Empty_product";

const AllProducts = () => {
  const {
    grid_view,
    sort,
    filters: { categoryId, min_price, max_price, price_range },
    setGridView,
    setListView,
    updateSort,
    clearFilters,
  } = useFilterContext();

  // Get the URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const genreParam = queryParams.get("genre");
  const searchParam = queryParams.get("search");

  // State for handling pagination and data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [genreProductIds, setGenreProductIds] = useState(null);
  const [genreName, setGenreName] = useState(null);
  const [isGenreLoading, setIsGenreLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(null);
  const itemsPerPage = 12;

  // For cursor-based pagination
  const pageSnapshotsRef = useRef({});
  const currentQueryRef = useRef(null); // Store current query parameters

  // For debouncing filters
  const filtersRef = useRef({
    categoryId,
    min_price,
    max_price,
    price_range,
    sort,
    genreProductIds,
    searchTerm,
  });
  const debounceTimerRef = useRef(null);
  const [debouncedFilters, setDebouncedFilters] = useState(filtersRef.current);

  // Process search parameter
  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam.toLowerCase().trim());
      clearFilters();
    } else {
      setSearchTerm(null);
    }
  }, [searchParam]);

  // Update filters ref when they change
  useEffect(() => {
    filtersRef.current = {
      categoryId,
      min_price,
      max_price,
      price_range,
      sort,
      genreProductIds,
      searchTerm,
    };

    // Debounce filter changes (300ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFilters(filtersRef.current);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    categoryId,
    min_price,
    max_price,
    price_range,
    sort,
    genreProductIds,
    searchTerm,
  ]);

  // Fetch genre product IDs if genre parameter exists
  useEffect(() => {
    const fetchGenreProductIds = async () => {
      if (!genreParam) {
        setGenreProductIds(null);
        return;
      }

      setIsGenreLoading(true);
      setLoading(true); // Also set main loading state to true
      try {
        const genreDocRef = doc(db, "genres", genreParam);
        const genreDoc = await getDoc(genreDocRef);

        if (genreDoc.exists()) {
          const genreData = genreDoc.data();
          if (genreData && genreData.name) {
            setGenreName(genreData.name);
            clearFilters();
          }
          if (genreData.product_ids && Array.isArray(genreData.product_ids)) {
            setGenreProductIds(genreData.product_ids);
          } else {
            setGenreProductIds([]);
            console.warn("Genre exists but has no product_ids array");
          }
        } else {
          setGenreProductIds([]);
          console.warn("Genre not found");
        }
      } catch (err) {
        console.error("Error fetching genre:", err);
        setError("Failed to fetch genre information");
      } finally {
        setIsGenreLoading(false);
      }
    };

    fetchGenreProductIds();
  }, [genreParam]);

  // Function to build the query based on filters
  const buildQuery = useCallback(
    (options = {}) => {
      const { startAfterDoc = null, batchIds = null } = options;

      let baseQuery = collection(db, "products");
      let constraints = [];

      // Add category filter if selected
      if (categoryId) {
        constraints.push(where("category_id", "==", categoryId));
      }

      // Add price range filters if both min and max are set
      if (price_range) {
        if (min_price !== null) {
          constraints.push(where("price", ">=", min_price));
        }
        if (max_price !== null) {
          constraints.push(where("price", "<=", max_price));
        }
      }

      // Add search term filter if provided
      if (searchTerm) {
        // Create search tags based on first few characters of search term
        // This follows the pattern in your search component
        const tagPrefix = searchTerm.substring(0, 2);
        constraints.push(where("tag", "array-contains", tagPrefix));
      }

      // Add specific batch of genre IDs if provided
      if (batchIds && batchIds.length > 0) {
        constraints.push(where("__name__", "in", batchIds));
      }
      // Or add all genre IDs if there are 10 or fewer
      else if (
        genreProductIds &&
        genreProductIds.length > 0 &&
        genreProductIds.length <= 10 &&
        !batchIds
      ) {
        constraints.push(where("__name__", "in", genreProductIds));
      }

      // Determine sort order
      let sortField = "created_at";
      let sortDirection = "desc";

      switch (sort) {
        case "price_lowest":
          sortField = "price";
          sortDirection = "asc";
          break;
        case "price_highest":
          sortField = "price";
          sortDirection = "desc";
          break;
        case "name_a_z":
          sortField = "name";
          sortDirection = "asc";
          break;
        case "name_z_a":
          sortField = "name";
          sortDirection = "desc";
          break;
        case "oldest":
          sortField = "created_at";
          sortDirection = "asc";
          break;
        default:
          // Default to newest
          sortField = "created_at";
          sortDirection = "desc";
      }

      // Construct the query with all constraints
      let finalQuery;

      if (constraints.length > 0) {
        finalQuery = query(
          baseQuery,
          ...constraints,
          orderBy(sortField, sortDirection),
          limit(itemsPerPage)
        );
      } else {
        finalQuery = query(
          baseQuery,
          orderBy(sortField, sortDirection),
          limit(itemsPerPage)
        );
      }

      // Add startAfter if paginating
      if (startAfterDoc) {
        finalQuery = query(finalQuery, startAfter(startAfterDoc));
      }

      return { finalQuery, sortField, sortDirection };
    },
    [
      categoryId,
      min_price,
      max_price,
      price_range,
      sort,
      genreProductIds,
      searchTerm,
      itemsPerPage,
    ]
  );

  // Efficient count function using aggregation queries
  const fetchTotalCount = useCallback(async () => {
    try {
      // If we have genre IDs, we'll calculate count differently
      if (genreProductIds && genreProductIds.length > 0) {
        // For large genre lists, we need an estimated count
        if (genreProductIds.length > 10) {
          // We could implement a more accurate count by batching,
          // but this is a reasonable approximation
          let filteredCount = genreProductIds.length;

          // Apply category filter estimation if needed
          if (categoryId) {
            // Get percentage of products in this category
            const categoryCountQuery = query(
              collection(db, "products"),
              where("category_id", "==", categoryId)
            );
            const categorySnapshot = await getCountFromServer(
              categoryCountQuery
            );
            const totalProductsQuery = query(collection(db, "products"));
            const totalSnapshot = await getCountFromServer(totalProductsQuery);

            const categoryPercentage =
              categorySnapshot.data().count / totalSnapshot.data().count;
            filteredCount = Math.round(
              genreProductIds.length * categoryPercentage
            );
          }

          // Apply price range filter estimation if needed
          if (price_range && (min_price !== null || max_price !== null)) {
            // Get percentage in price range (approximation)
            const priceCountQuery = query(
              collection(db, "products"),
              ...(min_price !== null ? [where("price", ">=", min_price)] : []),
              ...(max_price !== null ? [where("price", "<=", max_price)] : [])
            );
            const priceSnapshot = await getCountFromServer(priceCountQuery);
            const totalProductsQuery = query(collection(db, "products"));
            const totalSnapshot = await getCountFromServer(totalProductsQuery);

            const pricePercentage =
              priceSnapshot.data().count / totalSnapshot.data().count;
            filteredCount = Math.round(filteredCount * pricePercentage);
          }

          // Apply search filter estimation if needed
          if (searchTerm) {
            // Estimate for search term - this is a rough approximation
            // In a real app, you might want to refine this estimation
            filteredCount = Math.round(filteredCount * 0.2); // 20% match rate assumption
          }

          setTotalItems(filteredCount);
          setTotalPages(Math.ceil(filteredCount / itemsPerPage));
          return;
        }
        // For smaller genre lists (<=10 IDs)
        else {
          const countQuery = buildQuery().finalQuery;
          const countSnapshot = await getCountFromServer(countQuery);
          const count = countSnapshot.data().count;
          setTotalItems(count);
          setTotalPages(Math.ceil(count / itemsPerPage));
          return;
        }
      }

      // Normal count query without genre filtering
      let baseQuery = collection(db, "products");
      let constraints = [];

      if (categoryId) {
        constraints.push(where("category_id", "==", categoryId));
      }

      if (price_range) {
        if (min_price !== null) {
          constraints.push(where("price", ">=", min_price));
        }
        if (max_price !== null) {
          constraints.push(where("price", "<=", max_price));
        }
      }

      if (searchTerm) {
        // Use the same search tag prefix approach for consistency
        const tagPrefix = searchTerm.substring(0, 2);
        constraints.push(where("tag", "array-contains", tagPrefix));
      }

      let countQuery;
      if (constraints.length > 0) {
        countQuery = query(baseQuery, ...constraints);
      } else {
        countQuery = query(baseQuery);
      }

      // Use the new getCountFromServer aggregation
      const snapshot = await getCountFromServer(countQuery);
      const total = snapshot.data().count;

      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      console.error("Error getting document count:", err);
      setError("Failed to fetch product count");
    }
  }, [
    buildQuery,
    categoryId,
    genreProductIds,
    min_price,
    max_price,
    price_range,
    searchTerm,
    itemsPerPage,
  ]);

  // Function to handle large genre product ID lists
  const fetchProductsBatched = useCallback(
    async (page = 1) => {
      if (!genreProductIds || genreProductIds.length === 0) return [];

      setLoading(true);
      try {
        // Determine sort field and direction
        let sortField, sortDirection;
        switch (sort) {
          case "price_lowest":
            sortField = "price";
            sortDirection = "asc";
            break;
          case "price_highest":
            sortField = "price";
            sortDirection = "desc";
            break;
          case "name_a_z":
            sortField = "name";
            sortDirection = "asc";
            break;
          case "name_z_a":
            sortField = "name";
            sortDirection = "desc";
            break;
          case "oldest":
            sortField = "created_at";
            sortDirection = "asc";
            break;
          default:
            sortField = "created_at";
            sortDirection = "desc"; // Default to newest
        }

        // Get all products for the genreProductIds
        const allProductsMap = {};

        // Process in batches of 10 (Firestore limit for 'in' queries)
        const batchSize = 10;
        for (let i = 0; i < genreProductIds.length; i += batchSize) {
          const batchIds = genreProductIds.slice(i, i + batchSize);
          if (batchIds.length === 0) continue;

          // Create base query
          let batchQuery = query(
            collection(db, "products"),
            where("__name__", "in", batchIds)
          );

          // Add additional filters if present
          if (categoryId) {
            batchQuery = query(
              batchQuery,
              where("category_id", "==", categoryId)
            );
          }

          if (price_range) {
            if (min_price !== null) {
              batchQuery = query(batchQuery, where("price", ">=", min_price));
            }
            if (max_price !== null) {
              batchQuery = query(batchQuery, where("price", "<=", max_price));
            }
          }

          if (searchTerm) {
            // Use the same search tag approach
            const tagPrefix = searchTerm.substring(0, 2);
            batchQuery = query(
              batchQuery,
              where("tag", "array-contains", tagPrefix)
            );
          }

          // Execute query
          const batchSnapshot = await getDocs(batchQuery);

          // Add results to our collection
          batchSnapshot.docs.forEach((doc) => {
            allProductsMap[doc.id] = {
              id: doc.id,
              ...doc.data(),
            };
          });
        }

        // Convert map to array
        let allProducts = Object.values(allProductsMap);

        // Apply additional client-side filtering for search term
        if (searchTerm) {
          allProducts = allProducts.filter((product) => {
            if (!product.name) return false;
            const productNameLower = product.name.toLowerCase();
            // Split search term into words and check if all are in the product name
            const searchTerms = searchTerm.split(/\s+/);
            return searchTerms.every((term) => productNameLower.includes(term));
          });
        }

        // Sort the combined results according to the selected sort option
        allProducts = sortProductsManually(
          allProducts,
          sortField,
          sortDirection
        );

        // Store the total count
        const filteredTotal = allProducts.length;
        setTotalItems(filteredTotal);
        setTotalPages(Math.ceil(filteredTotal / itemsPerPage));

        // Paginate the results
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedProducts = allProducts.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        return paginatedProducts;
      } catch (err) {
        console.error("Error in batched fetch:", err);
        setError("Failed to fetch products");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [
      categoryId,
      genreProductIds,
      min_price,
      max_price,
      price_range,
      searchTerm,
      sort,
      itemsPerPage,
    ]
  );

  // Helper function to sort products manually
  const sortProductsManually = useCallback((products, field, direction) => {
    return [...products].sort((a, b) => {
      let comparison;

      if (field === "price") {
        comparison = a.price - b.price;
      } else if (field === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (field === "created_at") {
        comparison = (a.created_at || 0) - (b.created_at || 0);
      } else {
        comparison = 0; // Default, no sorting
      }

      return direction === "asc" ? comparison : -comparison;
    });
  }, []);

  // Check if the query parameters have changed
  const hasQueryChanged = useCallback((oldParams, newParams) => {
    if (!oldParams) return true;

    const keys = [
      "categoryId",
      "min_price",
      "max_price",
      "price_range",
      "sort",
      "genreProductIds",
      "searchTerm",
    ];

    for (const key of keys) {
      // Special handling for arrays
      if (key === "genreProductIds") {
        const oldIds = oldParams[key];
        const newIds = newParams[key];

        // If one is null/undefined and the other isn't
        if ((!oldIds && newIds) || (oldIds && !newIds)) return true;

        // If both are arrays but different lengths
        if (oldIds?.length !== newIds?.length) return true;

        // If arrays are different
        if (oldIds && newIds) {
          for (let i = 0; i < oldIds.length; i++) {
            if (oldIds[i] !== newIds[i]) return true;
          }
        }
      }
      // Regular comparison for non-arrays
      else if (oldParams[key] !== newParams[key]) {
        return true;
      }
    }

    return false;
  }, []);

  // Main function to fetch products
  const fetchProducts = useCallback(
    async (page = 1, isNewQuery = false) => {
      // Skip if genre info is still loading
      if (genreParam && isGenreLoading) {
        return;
      }

      setLoading(true);

      try {
        // Handle large genre lists differently
        if (genreProductIds && genreProductIds.length > 10) {
          const batchedProducts = await fetchProductsBatched(page);
          setProducts(batchedProducts);
          setCurrentPage(page);
          return;
        }

        // Check if we need to use the "in" query for genre IDs
        if (
          genreProductIds &&
          genreProductIds.length > 0 &&
          genreProductIds.length <= 10
        ) {
          let finalQuery;

          // Reset pagination cache if filters changed
          if (isNewQuery) {
            pageSnapshotsRef.current = {}; // Clear saved page snapshots
          }

          // First page or direct access to a page
          if (page === 1 || !pageSnapshotsRef.current[page - 1]) {
            if (page !== 1) {
              // We need all previous pages to get to this one
              let currentSnapshot = null;

              // Get to the page we want by accumulating all docs
              for (let i = 1; i < page; i++) {
                const { finalQuery: pageQuery } = buildQuery({
                  startAfterDoc: currentSnapshot,
                });

                const querySnapshot = await getDocs(pageQuery);
                if (querySnapshot.docs.length === 0) break;

                const lastVisible =
                  querySnapshot.docs[querySnapshot.docs.length - 1];
                pageSnapshotsRef.current[i] = lastVisible;
                currentSnapshot = lastVisible;
              }

              // Now get our actual target page
              const { finalQuery: targetPageQuery } = buildQuery({
                startAfterDoc: currentSnapshot,
              });
              finalQuery = targetPageQuery;
            } else {
              // Simple case - just get page 1
              const { finalQuery: firstPageQuery } = buildQuery();
              finalQuery = firstPageQuery;
            }
          }
          // Sequential navigation - we have the previous page snapshot
          else {
            const prevPageSnapshot = pageSnapshotsRef.current[page - 1];
            const { finalQuery: nextPageQuery } = buildQuery({
              startAfterDoc: prevPageSnapshot,
            });
            finalQuery = nextPageQuery;
          }

          // Execute the query
          const querySnapshot = await getDocs(finalQuery);

          // Save this page's last document for future pagination
          if (querySnapshot.docs.length > 0) {
            const lastVisible =
              querySnapshot.docs[querySnapshot.docs.length - 1];
            pageSnapshotsRef.current[page] = lastVisible;
          }

          // Extract product data
          let productList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Apply additional client-side filtering for search term
          if (searchTerm) {
            productList = productList.filter((product) => {
              if (!product.name) return false;
              const productNameLower = product.name.toLowerCase();
              // Split search term into words and check if all are in the product name
              const searchTerms = searchTerm.split(/\s+/);
              return searchTerms.every((term) =>
                productNameLower.includes(term)
              );
            });
          }

          // Update state
          setProducts(productList);
          setCurrentPage(page);
          return;
        }

        // Normal pagination flow for non-genre filtering
        let targetQuery;

        // Reset pagination cache if filters changed
        if (isNewQuery) {
          pageSnapshotsRef.current = {}; // Clear saved page snapshots
        }

        // First page or direct access to a page
        if (page === 1 || !pageSnapshotsRef.current[page - 1]) {
          if (page !== 1) {
            // We need all previous pages to get to this one
            let currentSnapshot = null;

            // Get to the page we want by accumulating all docs
            for (let i = 1; i < page; i++) {
              const { finalQuery } = buildQuery({
                startAfterDoc: currentSnapshot,
              });

              const querySnapshot = await getDocs(finalQuery);
              if (querySnapshot.docs.length === 0) break;

              const lastVisible =
                querySnapshot.docs[querySnapshot.docs.length - 1];
              pageSnapshotsRef.current[i] = lastVisible;
              currentSnapshot = lastVisible;
            }

            // Now get our actual target page
            const { finalQuery } = buildQuery({
              startAfterDoc: currentSnapshot,
            });
            targetQuery = finalQuery;
          } else {
            // Simple case - just get page 1
            const { finalQuery } = buildQuery();
            targetQuery = finalQuery;
          }
        }
        // Sequential navigation - we have the previous page snapshot
        else {
          const prevPageSnapshot = pageSnapshotsRef.current[page - 1];
          const { finalQuery } = buildQuery({
            startAfterDoc: prevPageSnapshot,
          });
          targetQuery = finalQuery;
        }

        // Execute the query
        const querySnapshot = await getDocs(targetQuery);

        // Save this page's last document for future pagination
        if (querySnapshot.docs.length > 0) {
          const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          pageSnapshotsRef.current[page] = lastVisible;
        }

        // Extract product data
        let productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply additional client-side filtering for search term
        if (searchTerm) {
          productList = productList.filter((product) => {
            if (!product.name) return false;
            const productNameLower = product.name.toLowerCase();
            // Split search term into words and check if all are in the product name
            const searchTerms = searchTerm.split(/\s+/);
            return searchTerms.every((term) => productNameLower.includes(term));
          });
        }

        // Update state
        setProducts(productList);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [
      buildQuery,
      fetchProductsBatched,
      genreProductIds,
      genreParam,
      isGenreLoading,
      searchTerm,
    ]
  );

  // Initial load and response to filter changes
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on load
    const isNewQuery = hasQueryChanged(
      currentQueryRef.current,
      debouncedFilters
    );

    if (isNewQuery) {
      // Reset pagination when filters change
      setCurrentPage(1);
      pageSnapshotsRef.current = {};
      currentQueryRef.current = { ...debouncedFilters };

      // Only continue if genre data is loaded (or not needed)
      if (!genreParam || (genreParam && genreProductIds !== null)) {
        fetchTotalCount();
        fetchProducts(1, true);
      }
    }
  }, [
    debouncedFilters,
    fetchProducts,
    fetchTotalCount,
    genreParam,
    genreProductIds,
    hasQueryChanged,
  ]);

  // Handle page change
  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
        <div className="mb-4 sm:mb-0">
          <p className="text-base font-medium">{totalItems} Products found</p>
          {genreParam && (
            <p className="text-sm text-gray-500">
              Filtered by genre: {isGenreLoading ? "loading..." : genreName}
            </p>
          )}
          {searchTerm && (
            <p className="text-sm text-gray-500">
              Search results for: "{searchTerm}"
            </p>
          )}
        </div>

        <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-start">
          <div className="flex gap-2">
            <button
              onClick={setGridView}
              className={`flex items-center justify-center rounded-md border p-2 transition-colors ${
                grid_view
                  ? "border-gray-400 bg-gray-100"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FaThLarge />
            </button>
            <button
              onClick={setListView}
              className={`flex items-center justify-center rounded-md border p-2 transition-colors ${
                !grid_view
                  ? "border-gray-400 bg-gray-100"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FaList />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium">
              sort by
            </label>
            <select
              name="sort"
              id="sort"
              value={sort}
              onChange={updateSort}
              className="cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_lowest">Price (Lowest)</option>
              <option value="price_highest">Price (Highest)</option>
              <option value="name_a_z">Name (A-Z)</option>
              <option value="name_z_a">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {loading || (genreParam && isGenreLoading) ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-l-gray-800"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="my-8 rounded-lg bg-red-50 p-8 text-center text-red-700">
          Error: {error}
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <Empty_product />
          ) : (
            <div
              className={
                grid_view
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "flex flex-col gap-6"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  listView={!grid_view}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AllProducts;
