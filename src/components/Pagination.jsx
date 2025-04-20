import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Function to generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Case: few pages
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Case: many pages - show ellipsis
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end === totalPages) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="my-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <button
        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors
        ${
          currentPage === 1
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center font-bold text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors
              ${
                currentPage === page
                  ? "border border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors
        ${
          currentPage === totalPages
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
