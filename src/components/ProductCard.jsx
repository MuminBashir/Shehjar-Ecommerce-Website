import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee } from "lucide-react";

const ProductCard = ({ product, listView }) => {
  const [isHovering, setIsHovering] = useState(false);

  if (!product) return null;

  const { id, name, price, thumbnail_image, zoomed_thumbnail_image } = product;

  const hoverImage = zoomed_thumbnail_image || thumbnail_image;

  const handleAddToCart = () => {
    console.log("Add to cart:", product); // Replace this with your actual action
  };

  if (listView) {
    return (
      <div className="group flex w-full border-b border-gray-200 bg-white py-4">
        <Link to={`/shop/${id}`} className="flex w-full">
          <div
            className="relative h-32 w-32 overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
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
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-3 w-max rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-primary/90"
            >
              Add to Cart
            </button>
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
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
