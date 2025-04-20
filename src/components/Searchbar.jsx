import React, { useEffect, useRef, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { Search, IndianRupee } from "lucide-react";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  // Query sorted by created_at instead of name
  const q = query(
    collection(db, "products"),
    orderBy("created_at", "desc"), // Sort by created_at in descending order (newest first)
    limit(100)
  );

  const [snapshot, loading, error] = useCollection(q);

  // Client-side filtering for case-insensitive and substring matching
  const results = React.useMemo(() => {
    if (!snapshot || !search.trim()) return [];

    const searchTerm = search.trim().toLowerCase();

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) =>
        // Case-insensitive check if the product name contains the search term
        product.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10); // Limit to 10 results for display
  }, [snapshot, search]);

  // Debug logs
  useEffect(() => {
    console.log("Search term:", search);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.log("Results:", results);
  }, [search, results, loading, error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Highlight the matching part of the text
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const searchRegex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(searchRegex);

    return parts.map((part, index) =>
      searchRegex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-normal">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Full width search input - always visible */}
      <div className="relative flex w-full items-center">
        <Search className="absolute left-3 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          className="w-full rounded-md border py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring focus:ring-primary"
        />
      </div>

      {/* Search results dropdown */}
      {isOpen && search && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 w-full rounded-md border bg-white p-2 shadow-md">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-sm text-red-500">
              Error fetching results
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-60 overflow-y-auto rounded-md bg-white bg-opacity-90 shadow-inner backdrop-blur-md">
              {results.map((item) => (
                <Link
                  key={item.id}
                  to={`/shop/${item.id}`}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100"
                  onClick={() => {
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={item.thumbnail_image}
                    alt={item.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {highlightMatch(item.name, search)}
                    </span>
                    {item.price && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-600">
                        <IndianRupee size={12} className="inline" />
                        {item.price}
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
