import React, { useState } from "react";
import { query, collection, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase/config";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const GenreBanner = ({ genre, reverse = false }) => {
  const genreQuery = query(
    collection(db, "genres"),
    where("name", "==", genre)
  );
  const [snapshot, loading, error] = useCollection(genreQuery);
  const [imageLoaded, setImageLoaded] = useState(false);

  const genreData = snapshot?.docs[0]?.data();
  const genreId = snapshot?.docs[0]?.id; // Get the document ID from Firestore snapshot

  if (loading) {
    return (
      <div className="my-5 flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
        <div className="animate-pulse text-gray-500">Loading genre...</div>
      </div>
    );
  }

  if (error || !genreData) {
    return (
      <div className="my-5 flex h-64 w-full items-center justify-center rounded-lg bg-red-50">
        <p className="text-red-500">
          {error ? "Error loading genre information." : "Genre not found."}
        </p>
      </div>
    );
  }

  const { name, thumbnail_image } = genreData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className="mx-5 my-5 overflow-hidden rounded-xl bg-gray-50 shadow-lg"
    >
      <div
        className={`flex flex-col md:flex-row ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-center overflow-hidden bg-gray-900"
        >
          <img
            src={thumbnail_image || "/api/placeholder/600/400"}
            alt={`${name} genre`}
            className="w-full object-cover"
            style={{ maxHeight: "500px" }}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">
                Loading image...
              </div>
            </div>
          )}
        </motion.div>

        {/* Text section */}
        <motion.div
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-10 text-center md:w-1/3"
        >
          <h2 className="mb-4 font-serif text-3xl font-bold text-gray-800 md:text-4xl">
            {name}'s Special
          </h2>
          <p className="mb-8 text-gray-600">
            Explore our precisely made collection of {name}
          </p>
          <Link
            to={`/shop?genre=${genreId}`}
            className="flex items-center gap-2 rounded-md border border-primary bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-primary"
          >
            <ShoppingBag size={18} />
            <span>Shop Now</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GenreBanner;
