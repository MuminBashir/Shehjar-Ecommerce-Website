import React, { useState, useEffect } from "react";
import { Rating } from "react-simple-star-rating";
import { toast } from "react-toastify";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/auth/auth_context";
import { useOrders } from "../context/orders/order_context";
import { User, ChevronDown, Trash2, XCircle, ShieldCheck } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  reviewId,
  isAdminDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <XCircle size={20} className="text-gray-500" />
          </button>
        </div>
        <p className="mb-6 text-gray-700">
          {isAdminDeleting
            ? "As an admin, you're about to delete a user's review. This action cannot be undone."
            : "Are you sure you want to delete this review? This action cannot be undone."}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reviewId)}
            className="rounded-md border border-red-600 bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductReview = ({
  productId,
  productRatings: initialProductRatings,
}) => {
  const { currentUser } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [rawProductRatings, setRawProductRatings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminDeleting, setIsAdminDeleting] = useState(false);

  // Use react-firebase-hooks to listen to the product document
  const [productDoc, productLoading, productError] = useDocument(
    doc(db, "products", productId)
  );

  // Get real-time updated productRatings
  useEffect(() => {
    if (productDoc?.data()) {
      const ratings = productDoc.data().ratings || [];
      setRawProductRatings(ratings);
    } else if (initialProductRatings) {
      setRawProductRatings(initialProductRatings);
    }
  }, [productDoc, initialProductRatings]);

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const adminsRef = collection(db, "admins");
        const q = query(adminsRef, where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);

        setIsAdmin(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Check if user has purchased the product - only for logged in users
  useEffect(() => {
    if (!currentUser) {
      setHasPurchased(false);
      setHasReviewed(false);
      setIsLoading(false);
      return;
    }

    if (ordersLoading) {
      setIsLoading(true);
      return;
    }

    try {
      // Check if the user has purchased this product from orders data
      const hasBoughtProduct = orders.some(
        (order) =>
          order.items &&
          order.items.some((item) => item.product_id === productId)
      );

      setHasPurchased(hasBoughtProduct);

      // Check if user has already reviewed this product
      if (rawProductRatings && rawProductRatings.length > 0) {
        const alreadyReviewed = rawProductRatings.some(
          (review) => review.email === currentUser.email
        );
        setHasReviewed(alreadyReviewed);
      } else {
        setHasReviewed(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking purchase history:", error);
      toast.error("Unable to verify purchase history");
      setIsLoading(false);
    }
  }, [currentUser, productId, orders, ordersLoading, rawProductRatings]);

  // Process reviews and get user information - this should run regardless of login state
  useEffect(() => {
    const processReviews = async () => {
      if (!rawProductRatings || rawProductRatings.length === 0) {
        setReviews([]);
        setDisplayedReviews([]);
        return;
      }

      try {
        // Sort reviews by date (newest first)
        const sortedRatings = [...rawProductRatings].sort(
          (a, b) => b.created_at?.toDate?.() - a.created_at?.toDate?.() || 0
        );

        const reviewsWithUserInfo = await Promise.all(
          sortedRatings.map(async (review, index) => {
            try {
              // Find user by email
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("email", "==", review.email));
              const querySnapshot = await getDocs(q);

              let userData = { displayName: "Anonymous", photoURL: null };

              querySnapshot.forEach((doc) => {
                const user = doc.data();
                userData = {
                  displayName: user.displayName || user.email.split("@")[0],
                  photoURL: user.photoURL,
                };
              });

              return {
                ...review,
                user: userData,
                id: index, // Add an id for tracking purposes
                isCurrentUser:
                  currentUser && review.email === currentUser.email,
                // Store the original review object for correct deletion
                originalReview: review,
              };
            } catch (error) {
              console.error("Error getting user info:", error);
              return {
                ...review,
                user: { displayName: "Anonymous", photoURL: null },
                id: index,
                isCurrentUser:
                  currentUser && review.email === currentUser.email,
                originalReview: review,
              };
            }
          })
        );

        setReviews(reviewsWithUserInfo);
        // Initially show only 5 reviews
        setDisplayedReviews(reviewsWithUserInfo.slice(0, 5));
        setShowMore(reviewsWithUserInfo.length > 5);
      } catch (error) {
        console.error("Error processing reviews:", error);
      }
    };

    processReviews();
  }, [rawProductRatings, currentUser]);

  const handleRatingChange = (rate) => {
    setRating(rate);
  };

  const handleShowMore = () => {
    const currentCount = displayedReviews.length;
    const newCount = currentCount + 5;
    setDisplayedReviews(reviews.slice(0, newCount));
    setShowMore(reviews.length > newCount);
  };

  const openDeleteModal = (review) => {
    // Check if user is admin or the review owner
    if (!currentUser) {
      toast.error("Please log in to perform this action");
      return;
    }

    if (review.email === currentUser.email || isAdmin) {
      setReviewToDelete(review);
      setIsAdminDeleting(isAdmin && review.email !== currentUser.email);
      setDeleteModalOpen(true);
    } else {
      toast.error("You can only delete your own reviews");
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
    setIsAdminDeleting(false);
  };

  const confirmDeleteReview = async (reviewId) => {
    if (!currentUser || reviewId === null || reviewId === undefined) return;

    const reviewToRemove = reviews.find((r) => r.id === reviewId);
    if (!reviewToRemove) {
      toast.error("Review not found");
      closeDeleteModal();
      return;
    }

    // Check if user is admin or the review owner
    if (reviewToRemove.email !== currentUser.email && !isAdmin) {
      toast.error("You don't have permission to delete this review");
      closeDeleteModal();
      return;
    }

    try {
      const productRef = doc(db, "products", productId);

      // Use the original review object that came from Firestore
      await updateDoc(productRef, {
        ratings: arrayRemove(reviewToRemove.originalReview),
      });

      if (isAdminDeleting) {
        toast.success("Review deleted successfully by admin!");
      } else {
        toast.success("Review deleted successfully!");
        setHasReviewed(false);
      }

      closeDeleteModal();

      // No need to manually update UI - the useDocument hook will handle it
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
      closeDeleteModal();
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please log in to leave a review");
      return;
    }

    if (!hasPurchased) {
      toast.error("You can only review products you've purchased");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      const productRef = doc(db, "products", productId);

      // Create new review object
      const reviewData = {
        email: currentUser.email,
        rate: rating,
        text: reviewText.trim(),
        created_at: new Date(),
      };

      // Add review to product's ratings array
      await updateDoc(productRef, {
        ratings: arrayUnion(reviewData),
      });

      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown date";
    try {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  if (productError) {
    console.error("Error fetching product:", productError);
    return (
      <div className="text-red-500">
        Error loading reviews. Please try again later.
      </div>
    );
  }

  // Determine if we're waiting for product data only
  // Don't include ordersLoading or isLoading when logged out
  const isContentLoading =
    productLoading || (currentUser && (ordersLoading || isLoading));

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      {/* Admin Badge */}
      {isAdmin && (
        <div className="mt-2 flex items-center gap-1 rounded-md bg-blue-50 p-2 text-blue-700">
          <ShieldCheck size={16} />
          <span className="text-sm font-medium">
            Admin Mode: You can delete any review
          </span>
        </div>
      )}

      {/* Review Form - Only show when logged in */}
      {currentUser && (
        <div className="mt-6 rounded-lg bg-gray-50 p-6">
          <form onSubmit={handleSubmitReview}>
            <h3 className="mb-4 text-xl font-semibold">Leave a Review</h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Your Rating
              </label>
              <div className="inline-flex">
                <Rating
                  onClick={handleRatingChange}
                  initialValue={rating}
                  size={28}
                  fillColor="#FFDF00"
                  allowFraction
                  SVGstyle={{ display: "inline-block", marginRight: "4px" }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="reviewText"
                className="mb-1 block text-sm font-medium"
              >
                Your Review (Optional)
              </label>
              <textarea
                id="reviewText"
                rows="4"
                className="w-full rounded-md border border-gray-300 p-2"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this product..."
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isContentLoading ||
                  (currentUser && hasReviewed) ||
                  !hasPurchased
                }
                className="rounded-md border border-primary bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-white hover:text-primary disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isSubmitting
                  ? "Submitting..."
                  : isContentLoading
                  ? "Loading..."
                  : currentUser && hasReviewed
                  ? "You've already reviewed this product"
                  : "Submit Review"}
              </button>
            </div>

            {/* Informational messages */}
            {currentUser && !hasPurchased && !isContentLoading && (
              <p className="mt-3 text-sm text-amber-700">
                Only customers who have purchased this product can leave
                reviews.
              </p>
            )}
            {currentUser &&
              hasPurchased &&
              hasReviewed &&
              !isContentLoading && (
                <p className="mt-3 text-sm text-green-700">
                  Thanks for your review! You can delete it if you wish to
                  update it.
                </p>
              )}
          </form>
        </div>
      )}

      {/* Login prompt when not signed in */}
      {!currentUser && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-blue-700">
          <p>
            You need to be logged in to leave a review. Viewing all reviews is
            available to everyone.
          </p>
        </div>
      )}

      {/* Display Reviews - Make sure this section shows regardless of login status */}
      <div className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">
          {reviews.length > 0 ? `${reviews.length} Reviews` : "No Reviews Yet"}
        </h3>

        {productLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : displayedReviews.length > 0 ? (
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                      {review.user.photoURL ? (
                        <img
                          src={review.user.photoURL}
                          alt={review.user.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-300">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{review.user.displayName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Delete button - Only show when logged in and for current user's reviews OR for admins */}
                  {(review.isCurrentUser || isAdmin) && (
                    <button
                      onClick={() => openDeleteModal(review)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                      title={
                        isAdmin && !review.isCurrentUser
                          ? "Admin: Delete user review"
                          : "Delete your review"
                      }
                    >
                      <Trash2 size={18} />
                      {isAdmin && !review.isCurrentUser && (
                        <span className="text-xs">Admin Delete</span>
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-2">
                  <div className="inline-flex">
                    <Rating
                      initialValue={review.rate}
                      size={20}
                      readonly
                      allowFraction
                      SVGstyle={{ display: "inline-block", marginRight: "3px" }}
                      fillColor="#FFDF00"
                    />
                  </div>
                </div>

                {review.text && (
                  <p className="mt-2 text-gray-700">{review.text}</p>
                )}
              </div>
            ))}

            {showMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleShowMore}
                  className="flex items-center justify-center gap-1 text-primary hover:underline"
                >
                  Show More <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-gray-50 p-6 text-center text-gray-500">
            <p>Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteReview}
        reviewId={reviewToDelete?.id}
        isAdminDeleting={isAdminDeleting}
      />
    </div>
  );
};

export default ProductReview;
