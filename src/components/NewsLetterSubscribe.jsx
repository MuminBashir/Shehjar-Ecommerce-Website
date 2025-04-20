import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NewsletterSubscribe = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'duplicate'
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setMessage("");

    try {
      const q = query(
        collection(db, "newsletter"),
        where("email", "==", email)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        setStatus("duplicate");
        setMessage("You’ve already subscribed with this email.");
        return;
      }

      await addDoc(collection(db, "newsletter"), {
        email,
        subscribed_at: serverTimestamp(),
      });

      setStatus("success");
      setMessage("Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      console.error("Subscription failed:", err);
      setStatus("error");
      setMessage("Oops! Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = () => {
    if (status === "success")
      return <CheckCircle className="text-green-500" size={22} />;
    if (status === "error" || status === "duplicate")
      return <XCircle className="text-red-500" size={22} />;
    return null;
  };

  return (
    <div className="mx-auto my-10 w-full max-w-xl rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-center text-2xl font-bold">
        Subscribe to our Newsletter
      </h2>
      <p className="mb-6 text-center text-gray-600">
        Get updates about new arrivals, offers & more.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 sm:flex-row"
      >
        <div className="relative w-full">
          <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full rounded-md border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || status === "success"}
          className="rounded-md bg-primary px-6 py-2 text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Subscribe"}
        </button>
      </form>

      {/* Animated status feedback */}
      <AnimatePresence>
        {status && (
          <motion.div
            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {getIcon()}
            <span
              className={
                status === "success"
                  ? "text-green-600"
                  : status === "duplicate"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsletterSubscribe;
