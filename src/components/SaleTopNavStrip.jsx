import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSale } from "../context/sale/sale_context";

const SaleTopNavStrip = () => {
  const { hasActiveSale, currentSale, isLoading } = useSale();

  if (isLoading || !hasActiveSale) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50 w-full bg-red-500 py-2 px-4 text-white shadow-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container relative mx-auto flex items-center justify-center md:justify-between">
          <div className="flex items-center space-x-2 text-sm sm:text-base">
            <span className="font-semibold tracking-wide">
              {currentSale?.title || "Special Offer!"}
            </span>
            <span className="hidden animate-pulse md:inline">• Live Now</span>
          </div>

          <Link
            to="/sale"
            className="group hidden items-center font-medium text-white transition-all duration-300 hover:text-yellow-300 md:flex"
          >
            Click here to checkout
            <motion.span
              className="ml-1"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              →
            </motion.span>
          </Link>

          <Link
            to="/sale"
            className="absolute right-4 font-bold text-white transition-transform hover:scale-110 md:hidden"
          >
            →
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SaleTopNavStrip;
