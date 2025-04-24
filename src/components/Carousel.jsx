import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const Carousel = ({ isMobile = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const bannerQuery = query(
    collection(db, "banners"),
    where("type", "==", isMobile ? "mobile" : "desktop")
  );

  const [bannersSnapshot, loading, error] = useCollection(bannerQuery);

  const banners =
    bannersSnapshot?.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) || [];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading)
    return (
      <div className="flex h-[50vh] w-full items-center justify-center bg-gray-100">
        Loading banners...
      </div>
    );
  if (error)
    return (
      <div className="h-[50vh] w-full bg-red-100">Error loading banners.</div>
    );
  if (banners.length === 0)
    return <div className="h-[50vh] w-full bg-gray-100">No banners found.</div>;

  return (
    <div className="relative h-[75vh] w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="h-[75vh] min-w-full">
            <img
              src={banner.imageUrl}
              alt={`Banner ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      {banners.length > 1 && (
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 transform rounded-full bg-white/70 p-2 text-black shadow hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Arrow */}
      {banners.length > 1 && (
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 transform rounded-full bg-white/70 p-2 text-black shadow hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={clsx(
                "h-2 w-6 rounded-full transition-all duration-300",
                activeIndex === index ? "bg-primary" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
