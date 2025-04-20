import React, { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import CategoryCard from "./CategoryCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryList = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [value, loading, error] = useCollection(
    query(collection(db, "categories"), showAll ? undefined : limit(8))
  );

  const handleCategoryClick = (categoryId) => {
    navigate(`/shop?category=${categoryId}`);
  };

  const handleShowMore = async () => {
    if (!allCategories.length) {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCategories(categories);
    }
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        Loading categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading categories: {error.message}
      </div>
    );
  }

  const displayedCategories = showAll
    ? allCategories
    : value?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const hasMoreToShow = value?.docs && value.docs.length === 8 && !showAll;
  const totalCount = showAll ? allCategories.length : value?.docs.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="my-5 font-serif text-4xl uppercase">Shop by category</h2>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.2, duration: 0.5 },
          },
        }}
      >
        {displayedCategories?.map((category) => (
          <motion.div
            key={category.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <CategoryCard
              category={category}
              onClick={() => handleCategoryClick(category.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Show more/less toggle button */}
      <div className="mt-8 flex justify-center">
        {hasMoreToShow && (
          <motion.button
            onClick={handleShowMore}
            className="rounded-md border border-primary bg-primary px-6 py-2 text-white transition-colors hover:bg-white hover:text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Show More Categories
          </motion.button>
        )}
        {showAll && totalCount > 8 && (
          <motion.button
            onClick={handleShowLess}
            className="rounded-md border border-primary bg-white px-6 py-2 text-primary transition-colors hover:bg-primary hover:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Show Less
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
