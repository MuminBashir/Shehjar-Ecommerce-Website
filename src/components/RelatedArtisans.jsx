import React from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, limit, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "lucide-react";

const RelatedArtisans = ({ currentArtisanId }) => {
  // Get artisans excluding the current one
  const artisansQuery = query(
    collection(db, "artisans"),
    where("__name__", "!=", currentArtisanId),
    // No orderBy needed for random selection
    limit(20) // Fetch more than we need so we can randomly select from them
  );

  const [value, loading, error] = useCollection(artisansQuery);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="mr-2 animate-spin" size={20} />
        <span>Loading related artisans...</span>
      </div>
    );
  }

  if (error || !value || value.docs.length === 0) {
    return null;
  }

  // Randomly select 4 artisans from the results
  const shuffled = [...value.docs].sort(() => 0.5 - Math.random());
  const randomArtisans = shuffled.slice(0, 4);

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold">More Artisan Stories</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {randomArtisans.map((doc) => {
          const artisan = doc.data();
          const timeAgo = formatDistanceToNow(
            artisan.created_at?.toDate() || new Date(),
            { addSuffix: true }
          );

          return (
            <Link
              to={`/artisan/${doc.id}`}
              key={doc.id}
              className="overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
            >
              <div className="flex h-40 items-center justify-center bg-gray-100">
                {artisan.image ? (
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium">{artisan.name}</h4>
                <p className="text-sm text-gray-500">Joined {timeAgo}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedArtisans;
