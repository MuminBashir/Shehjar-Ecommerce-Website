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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!value?.exists()) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Artisan Not Found</h1>
        <p className="mb-8">
          The artisan you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/artisans"
          className="inline-block rounded-md bg-primary px-6 py-3 text-white transition-colors hover:bg-opacity-90"
        >
          Browse All Artisans
        </Link>
      </div>
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
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          to="/artisans"
          className="mb-8 inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to All Artisans
        </Link>

        {/* Header */}
        <div className="mb-12">
          {image && (
            <div className="mb-8 rounded-lg shadow-lg">
              {/* Removed fixed height constraint to allow image to display at its natural aspect ratio */}
              <img
                src={image}
                alt={name}
                className="w-full rounded-lg bg-gray-50 object-contain"
              />
            </div>
          )}

          <h1 className="mb-4 text-4xl font-bold text-primary">{name}</h1>
          <div className="mb-8 flex flex-col gap-4 text-gray-600 md:flex-row md:items-center">
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              {formattedDate}
            </span>

            {phone && (
              <span className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                {phone}
              </span>
            )}

            {address && (
              <span className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-primary" />
                {address}
              </span>
            )}
          </div>
        </div>

        {/* Story Content */}
        <div className="prose prose-lg mb-12 max-w-none">
          {story ? (
            <div dangerouslySetInnerHTML={{ __html: story }} />
          ) : (
            <p className="italic text-gray-500">
              No story available for this artisan yet.
            </p>
          )}
        </div>

        {/* Share section */}
        <div className="mb-16 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-xl font-semibold">Share this story</h3>
          <div className="flex space-x-4">
            <WhatsappShareButton url={pageUrl} title={shareTitle}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>

            <LinkedinShareButton
              url={pageUrl}
              title={shareTitle}
              summary={shareDescription}
            >
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>

            <FacebookShareButton url={pageUrl} quote={shareTitle}>
              <FacebookIcon size={40} round />
            </FacebookShareButton>

            <TwitterShareButton url={pageUrl} title={shareTitle}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
          </div>
        </div>
      </div>

      {/* Related artisans section */}
      <RelatedArtisans currentArtisanId={id} />
    </div>
  );
};

export default SingleArtisanPage;
