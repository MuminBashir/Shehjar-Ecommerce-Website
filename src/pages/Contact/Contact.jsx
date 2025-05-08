import React, { useState, useEffect } from "react";
import { Breadcrumb } from "../../components";
import { motion } from "framer-motion";
import { BsTelephone, BsBuilding, BsGlobe, BsClock } from "react-icons/bs";
import { FiMail } from "react-icons/fi";
import {
  AiOutlineFacebook,
  AiFillTwitterSquare,
  AiOutlineLinkedin,
  AiOutlineInstagram,
} from "react-icons/ai";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add the query to Firestore
      await addDoc(collection(db, "queries"), {
        ...formData,
        created_at: serverTimestamp(),
      });

      // Reset form and show success message
      setFormData({
        name: "",
        email: "",
        phone: "",
        title: "",
        message: "",
      });
      toast.success("Your message has been sent successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mt-20">
      <Breadcrumb title="Contact Us" />
      <div className="container mx-auto px-5 py-10 xl:px-28">
        <motion.div
          className="grid grid-cols-1 gap-10 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Contact Information */}
          <motion.div variants={childVariants} className="space-y-8">
            <div>
              <h1 className="mb-4 text-3xl font-semibold tracking-wider text-primary">
                Get In Touch
              </h1>
              <p className="font-light leading-relaxed text-gray-600">
                We'd love to hear from you. Whether you have a question about
                our products, artisans, shipping, or anything else, our team is
                ready to answer all your questions.
              </p>
            </div>

            <div className="space-y-4 text-gray-600">
              <motion.div
                className="flex items-start space-x-4"
                variants={childVariants}
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BsBuilding className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="font-light">
                    Shehjar Complex Inderhama, Burzahama, Srinagar, Jammu &
                    Kashmir - 190006
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4"
                variants={childVariants}
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiMail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="font-light">info@shehjar.com</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4"
                variants={childVariants}
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BsTelephone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="font-light">(+91) 7889-771-848</p>
                  <p className="font-light">(+91) 7006-722-775</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4"
                variants={childVariants}
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BsGlobe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Website</h3>
                  <p className="font-light">www.shehjar.co.in</p>
                </div>
              </motion.div>
            </div>

            <div className="pt-4">
              <h3 className="mb-4 font-medium">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <AiOutlineFacebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <AiFillTwitterSquare className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <AiOutlineLinkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <AiOutlineInstagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={childVariants}>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-semibold text-primary">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Subject of your message"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your message"
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90 disabled:bg-gray-400"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="mb-6 text-2xl font-semibold text-primary">Find Us</h2>
          <div className="h-96 w-full overflow-hidden rounded-lg bg-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3301.0610112934687!2d74.85551783831659!3d34.170357753786114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e1859735d7c893%3A0xfa39d501a99bb8b!2sShehjaar%20Complex%20Inderhama%20(HELP%20Foundation%20J%26K)!5e0!3m2!1sen!2sin!4v1746717121115!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
