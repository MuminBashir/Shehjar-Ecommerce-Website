import React, { useState, useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import ArtisanCard from "../../components/ArtisansCard";
import Pagination from "../../components/Pagination";
import { Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ArtisansPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageSnapshots, setPageSnapshots] = useState({});
  const artisansPerPage = 10;

  // Get current query based on page state
  const artisansQuery = query(
    collection(db, "artisans"),
    orderBy("created_at", "desc"),
    limit(artisansPerPage)
  );

  // Get initial data
  const [value, loading, error] = useCollection(artisansQuery);

  // Get total count for pagination
  useEffect(() => {
    const getTotalCount = async () => {
      const countQuery = query(collection(db, "artisans"));
      const snapshot = await getDocs(countQuery);
      const totalDocs = snapshot.size;
      setTotalPages(Math.ceil(totalDocs / artisansPerPage));
    };

    getTotalCount();
  }, [artisansPerPage]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Handle page changes
  const handlePageChange = async (page) => {
    // If we already have this page cached, use it
    if (pageSnapshots[page]) {
      setCurrentPage(page);
      return;
    }

    // Otherwise, fetch the page
    let pageQuery;

    if (page === 1) {
      // First page
      pageQuery = query(
        collection(db, "artisans"),
        orderBy("created_at", "desc"),
        limit(artisansPerPage)
      );
    } else {
      // Find the previous page to get its last document
      const prevPage = Math.max(1, page - 1);
      let prevPageLastDoc;

      // Try to get from cache first
      if (pageSnapshots[prevPage]) {
        const prevPageDocs = pageSnapshots[prevPage].docs;
        prevPageLastDoc = prevPageDocs[prevPageDocs.length - 1];
      } else {
        // Otherwise, we need to fetch all pages up to this one (simplified approach)
        // In a real app, you might want to store cursor positions for each page
        const fetchPrevPage = query(
          collection(db, "artisans"),
          orderBy("created_at", "desc"),
          limit(artisansPerPage * prevPage)
        );

        const prevPageSnapshot = await getDocs(fetchPrevPage);
        prevPageLastDoc =
          prevPageSnapshot.docs[prevPageSnapshot.docs.length - 1];
      }

      pageQuery = query(
        collection(db, "artisans"),
        orderBy("created_at", "desc"),
        startAfter(prevPageLastDoc),
        limit(artisansPerPage)
      );
    }

    // Fetch the page data
    const pageSnapshot = await getDocs(pageQuery);

    // Store in cache
    setPageSnapshots((prev) => ({
      ...prev,
      [page]: pageSnapshot,
    }));

    setCurrentPage(page);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  if (loading) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-red-500">Error: {error.message}</div>
      </motion.div>
    );
  }

  // Use the cached page data if available, otherwise use the fetched data
  const displayData = pageSnapshots[currentPage] || value;

  return (
    <motion.div
      className="container mx-auto px-4 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="mb-8 text-center text-4xl font-bold"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Our Artisans
      </motion.h1>

      <motion.p
        className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600"
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Discover the talented artisans behind our unique products. Each artisan
        brings their own story, skill, and passion to create wonderful handmade
        items.
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div key={currentPage} {...pageTransition}>
          {displayData && displayData.docs.length > 0 ? (
            <>
              <motion.div
                className="mb-12 grid grid-cols-1 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {displayData.docs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    variants={itemVariants}
                    custom={index}
                  >
                    <ArtisanCard id={doc.id} artisan={doc.data()} />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            </>
          ) : (
            <motion.div
              className="py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl text-gray-500">No artisans found.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ArtisansPage;
