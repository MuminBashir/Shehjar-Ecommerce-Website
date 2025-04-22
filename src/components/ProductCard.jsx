import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee } from "lucide-react";
import AddToCart from "./AddToCart"; // Adjust the import path as needed

const ProductCard = ({ product, listView }) => {
  const [isHovering, setIsHovering] = useState(false);

  if (!product) return null;

  const {
    id,
    name,
    price,
    thumbnail_image,
    zoomed_thumbnail_image,
    combinations = [],
    isGICertified,
  } = product;

  const hoverImage = zoomed_thumbnail_image || thumbnail_image;

  // Get the first available combination for quick add
  const defaultCombination =
    combinations && combinations.length > 0 ? combinations[0] : null;
  const defaultSize = defaultCombination?.size || "";
  const defaultColor = defaultCombination?.color || "";
  const availableQuantity = defaultCombination?.quantity || 0;

  // GI Certified Tag Component
  const GICertifiedTag = () => (
    <div className="absolute right-0 top-0 z-10">
      <div className="flex items-center justify-center bg-white px-3 py-1 shadow-lg">
        <span
          className="text-xs font-bold"
          style={{
            background: "linear-gradient(to right, #ff00cc, #3399ff, #00ff99)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow:
              "0 0 5px rgba(255,105,180,0.7), 0 0 10px rgba(51,153,255,0.5), 0 0 15px rgba(0,255,153,0.5)",
          }}
        >
          GI Certified
        </span>
      </div>
    </div>
  );

  if (listView) {
    return (
      <div className="group flex w-full border-b border-gray-200 bg-white py-4">
        <Link to={`/shop/${id}`} className="flex w-full">
          <div
            className="relative h-32 w-32 overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isGICertified && <GICertifiedTag />}
            <img
              src={isHovering && hoverImage ? hoverImage : thumbnail_image}
              alt={name}
              className={`h-full w-full object-cover transition-transform duration-300 ${
                isHovering ? "scale-110" : "scale-100"
              }`}
            />
          </div>

          <div className="flex flex-1 flex-col justify-center px-4">
            <h3 className="font-serif text-lg font-medium text-gray-800 transition-all duration-300 group-hover:text-primary">
              {name}
            </h3>
            <p className="mt-1 flex items-center gap-1 font-semibold text-gray-900">
              <IndianRupee size={14} className="text-gray-900" />
              {price.toLocaleString()}
            </p>

            {defaultCombination ? (
              <div className="mt-2 w-max">
                <AddToCart
                  productId={id}
                  selectedSize={defaultSize}
                  selectedColor={defaultColor}
                  availableQuantity={availableQuantity}
                />
              </div>
            ) : (
              <Link
                to={`/shop/${id}`}
                className="mt-3 block w-max rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-primary/90"
              >
                View Details
              </Link>
            )}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="group flex min-w-[240px] max-w-[300px] flex-col bg-gray-50 pb-4">
      <Link to={`/shop/${id}`} className="block">
        <div
          className="relative h-64 overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {isGICertified && <GICertifiedTag />}
          <img
            src={isHovering && hoverImage ? hoverImage : thumbnail_image}
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-300 ${
              isHovering ? "scale-110" : "scale-100"
            }`}
          />
        </div>
        <div className="p-2 text-center">
          <h3 className="line-clamp-2 text-md mt-2 font-serif font-medium text-gray-800 transition-all duration-300 group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4">
            {name}
          </h3>
          <p className="mt-2 flex items-center justify-center gap-1 font-semibold text-gray-900">
            <IndianRupee size={14} className="text-gray-900" />
            {price.toLocaleString()}
          </p>
        </div>
      </Link>
      <div className="px-2">
        {defaultCombination ? (
          <AddToCart
            productId={id}
            selectedSize={defaultSize}
            selectedColor={defaultColor}
            availableQuantity={availableQuantity}
            isCard={true}
          />
        ) : (
          <Link
            to={`/shop/${id}`}
            className="mt-2 block w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
