import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { format } from "date-fns";
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
} from "react-share";
import RelatedArtisans from "../../../components/RelatedArtisans";
import { ArrowLeft, Loader, Phone, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SingleArtisanPage = () => {
  const { id } = useParams();
  const [value, loading, error] = useDocument(doc(db, "artisans", id));
  const [pageUrl, setPageUrl] = useState("");

  // Effect to set the page URL for sharing
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  // Effect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
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

  if (!value?.exists()) {
    return (
      <motion.div
        className="container mx-auto px-4 py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="mb-4 text-3xl font-bold"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          Artisan Not Found
        </motion.h1>
        <motion.p
          className="mb-8"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          The artisan you're looking for doesn't exist or has been removed.
        </motion.p>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/artisans"
            className="inline-block rounded-md bg-primary px-6 py-3 text-white transition-colors hover:bg-opacity-90"
          >
            Browse All Artisans
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const artisan = value.data();
  const { name, image, created_at, phone, address, story } = artisan;

  // Format the date
  const formattedDate = created_at?.toDate
    ? format(created_at.toDate(), "MMMM dd, yyyy")
    : "Date unavailable";

  // Share text
  const shareTitle = `Discover ${name}'s story and craftsmanship`;
  const shareDescription = `Learn about the creative journey of ${name}, one of our talented artisans.`;

  return (
    <AnimatePresence>
      <motion.div
        className="container mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto max-w-4xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Back link */}
          <motion.div variants={fadeIn}>
            <Link
              to="/artisans"
              className="mb-8 inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to All Artisans
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            className="mb-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {image && (
              <motion.div
                className="mb-8 overflow-hidden rounded-lg shadow-lg"
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={image}
                  alt={name}
                  className="w-full rounded-lg bg-gray-50 object-contain"
                />
              </motion.div>
            )}

            <motion.h1
              className="mb-4 text-4xl font-bold text-primary"
              variants={fadeIn}
            >
              {name}
            </motion.h1>

            <motion.div
              className="mb-8 flex flex-col gap-4 text-gray-600 md:flex-row md:items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.span className="flex items-center" variants={fadeIn}>
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                {formattedDate}
              </motion.span>

              {phone && (
                <motion.span className="flex items-center" variants={fadeIn}>
                  <Phone className="mr-2 h-4 w-4 text-primary" />
                  {phone}
                </motion.span>
              )}

              {address && (
                <motion.span className="flex items-center" variants={fadeIn}>
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  {address}
                </motion.span>
              )}
            </motion.div>
          </motion.div>

          {/* Story Content */}
          <motion.div
            className="prose prose-lg mb-12 max-w-none"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {story ? (
              <div dangerouslySetInnerHTML={{ __html: story }} />
            ) : (
              <p className="italic text-gray-500">
                No story available for this artisan yet.
              </p>
            )}
          </motion.div>

          {/* Share section */}
          <motion.div
            className="mb-16 border-t border-gray-200 pt-8"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <motion.h3
              className="mb-4 text-xl font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Share this story
            </motion.h3>

            <motion.div
              className="flex space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <WhatsappShareButton url={pageUrl} title={shareTitle}>
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LinkedinShareButton
                  url={pageUrl}
                  title={shareTitle}
                  summary={shareDescription}
                >
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FacebookShareButton url={pageUrl} quote={shareTitle}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <TwitterShareButton url={pageUrl} title={shareTitle}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Related artisans section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <RelatedArtisans currentArtisanId={id} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SingleArtisanPage;
