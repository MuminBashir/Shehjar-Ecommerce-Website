import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import ProductCard from "./ProductCard";
import { ArrowLeft, ArrowRight, ArrowRightCircle } from "lucide-react";
import { motion } from "framer-motion";

const GenreList = ({ genre, title }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const genresQuery = query(
    collection(db, "genres"),
    where("name", "==", genre)
  );

  const [genreSnapshot, genreLoading, genreError] = useCollection(genresQuery);
  const genreDoc = genreSnapshot?.docs[0];
  const genreId = genreDoc?.id; // Get the document ID from the genre document
  const productIds = genreDoc?.data()?.product_ids || [];
  const limitedProductIds = productIds.slice(0, 10);

  const productsQuery =
    limitedProductIds.length > 0
      ? query(
          collection(db, "products"),
          where("__name__", "in", limitedProductIds),
          orderBy("created_at", "desc"),
          limit(10)
        )
      : null;

  const [products, productsLoading, productsError] = useCollectionData(
    productsQuery,
    { idField: "id" }
  );

  const isLoading = genreLoading || productsLoading;
  const error = genreError || productsError;

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth * 0.6; // 60% scroll
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const startDrag = (e) => {
    setIsDragging(true);
    setStartX(e.pageX || e.touches[0].pageX);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const duringDrag = (e) => {
    if (!isDragging) return;
    const x = e.pageX || e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading products: {error.message}
      </div>
    );
  }

  if (!genre) {
    return <div className="p-4 text-red-500">No genre specified</div>;
  }

  if (genreSnapshot && genreSnapshot.empty) {
    return <div className="p-4 text-red-500">Genre '{genre}' not found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className="my-8"
    >
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="font-serif text-4xl uppercase">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleScroll("left")}
            className="rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800"></div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onMouseDown={startDrag}
          onMouseMove={duringDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={startDrag}
          onTouchMove={duringDrag}
          onTouchEnd={stopDrag}
          className="scrollbar-hide flex cursor-grab space-x-4 overflow-x-auto px-4 pb-4 active:cursor-grabbing"
        >
          {products &&
            products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}

          {productIds.length > 0 && (
            <Link
              to={`/shop?genre=${genreId}`}
              className="flex h-64 min-w-[240px] max-w-[300px] flex-col items-center justify-center bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <div className="p-4 text-center">
                <p className="font-medium text-gray-800">View More</p>
                <p className="flex justify-center">
                  <ArrowRightCircle />
                </p>
              </div>
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default GenreList;
