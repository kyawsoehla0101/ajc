import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  // Skip rendering if pagination is not needed (0 or 1 page)
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6 gap-2 select-none">

      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md border 
          ${currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
      >
        Prev
      </button>

      {/* Page number buttons */}
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        const isActive = currentPage === page;

        return (
          <button
            key={i}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md border 
              ${isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md border 
          ${currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
      >
        Next
      </button>

    </div>
  );
}
