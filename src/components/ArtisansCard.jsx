import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Calendar } from "lucide-react";

const ArtisanCard = ({ id, artisan }) => {
  const { name, image, created_at } = artisan;

  // Parse the timestamp from Firestore
  const createdDate = created_at?.toDate ? created_at.toDate() : new Date();
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <Link to={`/artisan/${id}`} className="group block">
      <div className="flex h-40 flex-row overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Image Section - smaller and square */}
        <div className="h-40 w-40 flex-shrink-0 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-400">No Image</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden p-4">
          <div>
            <h2 className="truncate text-lg font-semibold text-primary">
              {name}
            </h2>
            <div className="mt-1 mb-2 flex items-center text-xs text-gray-500">
              <Calendar className="mr-1 h-3 w-3 text-gray-400" />
              <span>{timeAgo}</span>
            </div>
            <p className="line-clamp-2 text-sm text-gray-600">
              Discover the story and craftsmanship behind {name}'s unique
              handmade creations.
            </p>
          </div>

          {/* Action Section */}
          <div className="mt-2 flex items-center text-sm font-medium text-primary">
            <span className="mr-1 transition-all group-hover:mr-2">
              Read their story
            </span>
            <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtisanCard;
