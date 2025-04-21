import React, { useEffect, useRef, useState } from "react";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { Search, IndianRupee } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const wrapperRef = useRef(null);

  // Determine if search should be active (2+ characters)
  const shouldSearch = searchInput.trim().length >= 2;

  // Process search terms
  const processedTerms = React.useMemo(() => {
    if (!shouldSearch) return [];

    try {
      // Convert to lowercase and split by spaces
      return searchInput.trim().toLowerCase().split(/\s+/);
    } catch (err) {
      console.error("Error processing search terms:", err);
      return [];
    }
  }, [searchInput, shouldSearch]);

  // Create the Firestore query based on search terms
  const searchQuery = React.useMemo(() => {
    try {
      if (!shouldSearch || processedTerms.length === 0) {
        // Default query when not searching
        return query(
          collection(db, "products"),
          orderBy("created_at", "desc"),
          limit(10)
        );
      }

      // For the first term, look for exact tag matches
      const firstTerm = processedTerms[0];

      // Use the first 2 characters of the first term for the tag query
      // This optimizes the query by using a prefix match
      const tagPrefix = firstTerm.substring(0, 2);

      console.log("Searching with tag prefix:", tagPrefix);

      return query(
        collection(db, "products"),
        where("tag", "array-contains", tagPrefix),
        orderBy("created_at", "desc"),
        limit(50) // Fetch more than needed for client-side filtering
      );
    } catch (err) {
      console.error("Error creating search query:", err);
      // Fallback to a simple query in case of error
      return query(
        collection(db, "products"),
        orderBy("created_at", "desc"),
        limit(10)
      );
    }
  }, [processedTerms, shouldSearch]);

  const [snapshot, loading, error] = useCollection(searchQuery);

  // Log any errors from the query
  useEffect(() => {
    if (error) {
      console.error("Firestore query error:", error);
    }
  }, [error]);

  // Filter results client-side for multi-term search
  const results = React.useMemo(() => {
    try {
      if (!snapshot || !shouldSearch) return [];

      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(
        `Retrieved ${allProducts.length} products from initial query`
      );

      const filteredResults = allProducts
        .filter((product) => {
          try {
            // Check if product has a name property
            if (!product.name) {
              console.warn("Product missing name property:", product.id);
              return false;
            }

            // Convert product name to lowercase for case-insensitive comparison
            const productNameLower = product.name.toLowerCase();

            // Check if all search terms are in the product name
            return processedTerms.every((term) =>
              productNameLower.includes(term)
            );
          } catch (err) {
            console.error("Error filtering product:", product.id, err);
            return false;
          }
        })
        .slice(0, 10); // Take only top 10 matches

      console.log(`Filtered to ${filteredResults.length} matching products`);
      return filteredResults;
    } catch (err) {
      console.error("Error processing search results:", err);
      return [];
    }
  }, [snapshot, processedTerms, shouldSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler for the Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      try {
        // Navigate to the search results page with the search query
        navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
        setIsOpen(false);
      } catch (err) {
        console.error("Error navigating to search results:", err);
      }
    }
  };

  // Highlight the matching parts of text
  const highlightMatches = (text) => {
    if (!shouldSearch) return text;

    try {
      let result = text;

      // Create a copy of the text to highlight
      processedTerms.forEach((term) => {
        // Escape special regex characters in the search term
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Create regex that's case insensitive
        const regex = new RegExp(`(${escapedTerm})`, "gi");

        // Replace with highlighted version
        result = result.replace(
          regex,
          (part) => `<mark class="bg-yellow-200 font-normal">${part}</mark>`
        );
      });

      // Return as HTML
      return <span dangerouslySetInnerHTML={{ __html: result }} />;
    } catch (err) {
      console.error("Error highlighting text:", err);
      return text;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search input */}
      <div className="relative flex w-full items-center">
        <Search className="absolute left-3 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            try {
              setSearchInput(e.target.value);
            } catch (err) {
              console.error("Error updating search input:", err);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyPress={handleKeyPress}
          placeholder="Search products..."
          className="w-full rounded-md border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring focus:ring-primary"
        />
      </div>

      {/* Search results dropdown */}
      {isOpen && shouldSearch && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 w-full rounded-md border bg-white p-2 shadow-md">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-sm text-red-500">
              Error fetching results: {error.message}
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-60 overflow-y-auto rounded-md bg-white bg-opacity-90 shadow-inner backdrop-blur-md">
              {results.map((item) => (
                <Link
                  key={item.id}
                  to={`/shop/${item.id}`}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100"
                  onClick={() => {
                    try {
                      setSearchInput("");
                      setIsOpen(false);
                    } catch (err) {
                      console.error("Error clearing search:", err);
                    }
                  }}
                >
                  {item.thumbnail_image ? (
                    <img
                      src={item.thumbnail_image}
                      alt={item.name}
                      className="h-10 w-10 rounded object-cover"
                      onError={(e) => {
                        console.error("Image load error for product:", item.id);
                        e.target.src = "/placeholder-image.jpg"; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                      <span className="text-xs text-gray-500">No img</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {highlightMatches(item.name)}
                    </span>
                    {item.price !== undefined ? (
                      <span className="flex items-center gap-0.5 text-xs text-gray-600">
                        <IndianRupee size={12} className="inline" />
                        {item.price}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Price not available
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              No matching products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
