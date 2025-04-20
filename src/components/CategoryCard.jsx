import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFilterContext } from "../context/filter/filter_context";

const CategoryCard = ({ category }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { updateFilters } = useFilterContext();

  const handleCategoryClick = () => {
    // Update the filter context with the selected category ID
    updateFilters({
      target: {
        name: "categoryId",
        value: category.id,
      },
    });

    // Navigate to the shop page without query parameters
    navigate("/shop");
  };

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCategoryClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={category.image_url}
          alt={category.category_name}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="relative">
            <h3 className="text-lg font-semibold text-white">
              {category.category_name}
            </h3>
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
              style={{
                width: isHovered ? "100%" : "0%",
                transitionProperty: "width",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
