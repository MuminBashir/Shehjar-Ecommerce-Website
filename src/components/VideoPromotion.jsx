import React, { useState } from "react";
import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase/config";
import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

const VideoPromotion = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [snapshot, loading, error] = useCollection(collection(db, "promotion"));

  const videoUrl = snapshot?.docs[0]?.data()?.video_url;

  if (loading) {
    return (
      <div className="my-10 flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
        <div className="animate-pulse text-gray-500">Loading promotion...</div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="my-10 flex h-64 w-full items-center justify-center rounded-lg bg-yellow-50">
        <p className="text-yellow-700">
          {error
            ? "Failed to load promotional video."
            : "No promotional video found."}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative my-10 aspect-video overflow-hidden rounded-xl bg-black shadow-lg"
    >
      {!isPlaying ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <video
            src={videoUrl}
            className="h-full w-full object-cover"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PlayCircle
                size={64}
                className="text-white transition-transform hover:scale-110"
              />
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.video
          key="playing-video"
          src={videoUrl}
          className="h-full w-full object-contain"
          controls
          autoPlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
};

export default VideoPromotion;
