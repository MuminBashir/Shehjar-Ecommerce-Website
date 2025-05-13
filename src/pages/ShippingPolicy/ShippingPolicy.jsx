import React, { useEffect } from "react";
import { Breadcrumb } from "../../components";
import { motion } from "framer-motion";
import { doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useDocument } from "react-firebase-hooks/firestore";

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch delivery pricing data from Firebase
  const [deliveryData, loading, error] = useDocument(
    doc(db, "delivery", "current_delivery")
  );

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

  // Format currency for display
  const formatCurrency = (amount, currency = "₹") => {
    return `${currency}${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="mt-32 md:mt-28">
      <Breadcrumb title="Shipping Policy" />
      <motion.div
        className="container mx-auto px-5 py-10 xl:px-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={childVariants}>
          <h1 className="mb-8 text-3xl font-semibold tracking-wider text-primary">
            Shipping Policy
          </h1>

          <div className="mb-4 border-l-4 border-primary bg-primary/5 p-4 text-gray-700">
            <p className="font-medium">Effective Date: 01-05-2025</p>
          </div>

          {loading && (
            <div className="my-10 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="my-6 rounded-md bg-red-50 p-4 text-red-600">
              <p className="font-medium">Error loading delivery information</p>
              <p className="mt-1 text-sm">
                Please try refreshing the page or contact our support team.
              </p>
            </div>
          )}

          {!loading && !error && deliveryData && (
            <div className="space-y-8 font-light leading-relaxed text-gray-700">
              <p>
                Welcome to <span className="font-semibold">Shehjar.co.in</span>,
                your gateway to authentic handcrafted products created by
                Kashmiri women artisans. As every item on our platform is{" "}
                <span className="font-semibold">handmade with care</span>, we
                value transparency in how we deliver these treasures to your
                doorstep.
              </p>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Order Processing Time
                </h2>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    All our products are{" "}
                    <span className="font-semibold">handmade</span> and often{" "}
                    <span className="font-semibold">made to order</span>.
                  </li>
                  <li>
                    Orders are typically processed within{" "}
                    <span className="font-semibold">3–7 business days</span>{" "}
                    (excluding Sundays and public holidays).
                  </li>
                  <li>
                    During{" "}
                    <span className="font-semibold">high-demand periods</span>{" "}
                    or festivals, processing may take slightly longer. You will
                    be notified via email in such cases.
                  </li>
                </ul>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Shipping Time
                </h2>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    <span className="font-semibold">
                      Domestic Orders (India):
                    </span>{" "}
                    Once dispatched, orders generally take{" "}
                    <span className="font-semibold">5–10 business days</span>{" "}
                    for delivery, depending on your location.
                  </li>
                  <li>
                    <span className="font-semibold">International Orders:</span>{" "}
                    Delivery may take{" "}
                    <span className="font-semibold">10–20 business days</span>{" "}
                    or more, depending on the destination and customs clearance.
                  </li>
                </ul>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Shipping Charges
                </h2>
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Standard Shipping
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          Free Shipping Threshold
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          <span className="font-semibold">India</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          <span className="font-semibold">
                            {formatCurrency(
                              deliveryData.data().indian_delivery_cost
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          Orders above{" "}
                          <span className="font-semibold">
                            {formatCurrency(
                              deliveryData.data().free_indian_delivery
                            )}
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          <span className="font-semibold">International</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          Starting from{" "}
                          <span className="font-semibold">
                            {formatCurrency(
                              deliveryData.data().international_delivery_cost
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          Orders above{" "}
                          <span className="font-semibold">
                            {formatCurrency(
                              deliveryData.data().free_international_delivery
                            )}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    <span className="font-semibold">Within India:</span> We
                    offer <span className="font-semibold">free shipping</span>{" "}
                    on orders above{" "}
                    <span className="font-semibold">
                      {formatCurrency(deliveryData.data().free_indian_delivery)}
                    </span>
                    . For orders below this value, a flat shipping rate of{" "}
                    <span className="font-semibold">
                      {formatCurrency(deliveryData.data().indian_delivery_cost)}
                    </span>{" "}
                    is applicable.
                  </li>
                  <li>
                    <span className="font-semibold">
                      International Shipping:
                    </span>{" "}
                    Basic charges start from{" "}
                    <span className="font-semibold">
                      {formatCurrency(
                        deliveryData.data().international_delivery_cost
                      )}
                    </span>{" "}
                    and vary based on destination and order weight. Free
                    shipping is available on international orders above{" "}
                    <span className="font-semibold">
                      {formatCurrency(
                        deliveryData.data().free_international_delivery
                      )}
                    </span>
                    .
                  </li>
                </ul>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Shipment Tracking
                </h2>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    Once your order is dispatched, a{" "}
                    <span className="font-semibold">tracking number</span> and
                    courier details will be shared with you via email or SMS.
                  </li>
                  <li>
                    You can track your order via the courier's tracking link or
                    by logging into your account on{" "}
                    <span className="font-semibold">shehjar.co.in</span>.
                  </li>
                </ul>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Delivery Delays
                </h2>
                <p>
                  We strive to ensure timely deliveries, but please note that{" "}
                  <span className="font-semibold">delays may occur</span> due
                  to:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Natural calamities</li>
                  <li>
                    Political disturbances or curfews (particularly in Kashmir)
                  </li>
                  <li>Logistics partner delays</li>
                  <li>Customs clearance for international orders</li>
                </ul>
                <p>
                  We appreciate your patience and understanding, especially
                  since many of our artisans operate from{" "}
                  <span className="font-semibold">
                    remote or challenging areas
                  </span>
                  .
                </p>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Address & Contact Details
                </h2>
                <p>
                  Please ensure that your shipping address and contact number
                  are{" "}
                  <span className="font-semibold">accurate and complete</span>{" "}
                  at the time of order placement. We are{" "}
                  <span className="font-semibold">not responsible</span> for
                  delays or non-delivery resulting from incorrect or incomplete
                  address details.
                </p>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Multiple Shipments
                </h2>
                <p>
                  If your order contains multiple products, they may be{" "}
                  <span className="font-semibold">shipped separately</span>{" "}
                  depending on availability and artisan source. You will receive
                  tracking updates for each shipment.
                </p>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Delivery Partners
                </h2>
                <p>
                  We work with reliable logistics and courier partners such as{" "}
                  <span className="font-semibold">
                    India Post, Delhivery, Blue Dart
                  </span>
                  , and international shipping providers to ensure safe
                  delivery.
                </p>
              </motion.div>

              <motion.div variants={childVariants} className="space-y-4">
                <h2 className="text-2xl font-medium text-primary">
                  Inquiries & Support
                </h2>
                <p>
                  For shipping-related queries or concerns, reach out to us at:
                </p>
                <div className="ml-6 space-y-2">
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    info@shehjar.co.in
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    +91-7006-722-775
                  </p>
                  <p>
                    <span className="font-semibold">Timings:</span>{" "}
                    Monday–Saturday, 10 AM to 6 PM IST
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm font-light text-gray-500">
              Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ShippingPolicy;
