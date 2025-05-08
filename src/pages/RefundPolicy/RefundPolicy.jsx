import React, { useEffect } from "react";
import { Breadcrumb } from "../../components";
import { motion } from "framer-motion";

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <div className="mt-20">
      <Breadcrumb title="Return & Refund Policy" />
      <motion.div
        className="container mx-auto px-5 py-10 xl:px-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={childVariants}>
          <h1 className="mb-8 text-3xl font-semibold tracking-wider text-primary">
            Return, Exchange & Refund Policy
          </h1>

          <div className="mb-4 border-l-4 border-primary bg-primary/5 p-4 text-gray-700">
            <p className="font-medium">Effective Date: 01-05-2025</p>
          </div>

          <div className="space-y-8 font-light leading-relaxed text-gray-700">
            <p>
              At <span className="font-semibold">Shehjar.co.in</span>, each
              product is a piece of Kashmiri heritage—handcrafted with love by
              women artisans from marginalised communities. As each item is
              <span className="font-semibold">
                {" "}
                unique and often made to order
              </span>
              , we request your understanding and support of our fair-use policy
              for returns and refunds.
            </p>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                1. Return Policy
              </h2>
              <p className="font-medium">
                We accept returns only under the following conditions:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  The product received is{" "}
                  <span className="font-semibold">
                    damaged, defective, or incorrect
                  </span>
                  .
                </li>
                <li>
                  The return request is raised{" "}
                  <span className="font-semibold">within 3 days</span> of
                  receiving the product.
                </li>
                <li>
                  The item must be{" "}
                  <span className="font-semibold">
                    unused, unwashed, and in its original packaging
                  </span>{" "}
                  with tags intact.
                </li>
              </ul>

              <p className="font-medium">We do not accept returns for:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Slight irregularities in weave, embroidery, or colour that
                  occur naturally in handmade items.
                </li>
                <li>
                  Products purchased on{" "}
                  <span className="font-semibold">
                    sale or during promotional offers
                  </span>
                  .
                </li>
                <li>
                  <span className="font-semibold">
                    Personalized or custom-made orders
                  </span>
                  .
                </li>
              </ul>

              <div className="rounded-md bg-gray-50 p-4 italic">
                <p>
                  Note: As a platform that empowers artisan livelihoods, we{" "}
                  <span className="font-semibold">
                    do not encourage discretionary returns
                  </span>
                  .
                </p>
              </div>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                2. Exchange Policy
              </h2>
              <p className="font-medium">
                We offer exchanges only in the following cases:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  You received the{" "}
                  <span className="font-semibold">wrong item</span>.
                </li>
                <li>
                  The product is{" "}
                  <span className="font-semibold">
                    damaged or has a quality issue
                  </span>{" "}
                  verified by our team.
                </li>
              </ul>

              <p>
                Exchange requests must be made{" "}
                <span className="font-semibold">within 3 days of delivery</span>{" "}
                and will be processed only after receiving and inspecting the
                returned item.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                3. Refund Policy
              </h2>
              <p className="font-medium">
                Refunds are processed under the following conditions:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  A replacement is{" "}
                  <span className="font-semibold">
                    not possible due to stock unavailability
                  </span>
                  .
                </li>
                <li>
                  The product is{" "}
                  <span className="font-semibold">
                    damaged or lost in transit
                  </span>
                  , and a valid complaint is raised with proof.
                </li>
                <li>
                  You{" "}
                  <span className="font-semibold">
                    cancel a prepaid order before it is shipped
                  </span>
                  .
                </li>
              </ul>

              <p className="font-medium">Refunds will be:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Initiated{" "}
                  <span className="font-semibold">within 7 working days</span>{" "}
                  after approval.
                </li>
                <li>
                  Issued to your{" "}
                  <span className="font-semibold">original payment method</span>{" "}
                  or as store credit (as per your preference).
                </li>
                <li>
                  For{" "}
                  <span className="font-semibold">Cash-on-Delivery orders</span>
                  , refund will be made via{" "}
                  <span className="font-semibold">NEFT/IMPS transfer</span> to
                  your bank account. Bank details will be requested via email
                  after return approval.
                </li>
              </ul>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                4. How to Raise a Return or Exchange Request
              </h2>
              <p className="font-medium">To initiate a return or exchange:</p>
              <ol className="ml-6 list-decimal space-y-2">
                <li>
                  Email us at{" "}
                  <span className="font-semibold">info@shehjar.co.in</span>{" "}
                  within 3 days of delivery.
                </li>
                <li>
                  Mention your{" "}
                  <span className="font-semibold">
                    Order ID, product details
                  </span>
                  , and include{" "}
                  <span className="font-semibold">
                    clear photographs of the item and packaging
                  </span>
                  .
                </li>
                <li>
                  Our team will review the request and guide you through the
                  process.
                </li>
              </ol>

              <p>
                Approved returns must be shipped back to us{" "}
                <span className="font-semibold">
                  within 5 days of confirmation
                </span>
                .
              </p>
              <p>
                Return shipping charges will be{" "}
                <span className="font-semibold">borne by the customer</span>{" "}
                unless the return is due to an error on our part.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                5. Cancellation Policy
              </h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Orders can be cancelled{" "}
                  <span className="font-semibold">
                    within 12 hours of placement
                  </span>{" "}
                  by writing to us at info@shehjar.co.in.
                </li>
                <li>
                  Once shipped, an order{" "}
                  <span className="font-semibold">cannot be cancelled</span>.
                </li>
              </ul>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                6. Important Notes
              </h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Refunds and exchanges are processed{" "}
                  <span className="font-semibold">
                    only after receipt and inspection of the returned item
                  </span>
                  .
                </li>
                <li>
                  We reserve the right to{" "}
                  <span className="font-semibold">deny returns</span> if the
                  product does not meet our return conditions.
                </li>
                <li>
                  Our artisans depend on each purchase—
                  <span className="font-semibold">
                    thank you for buying responsibly
                  </span>
                  .
                </li>
              </ul>
            </motion.div>

            <motion.div
              variants={childVariants}
              className="space-y-4 rounded-lg bg-gray-50 p-6"
            >
              <h2 className="text-2xl font-medium text-primary">Need Help?</h2>
              <p className="text-center">
                We're here to assist you with genuine concerns.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="font-medium">Contact Information:</p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      info@shehjar.co.in
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      +91-7006-722-775
                    </p>
                    <p>
                      <span className="font-semibold">Support Hours:</span>{" "}
                      Mon–Sat, 10 AM to 6 PM IST
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Office Address:</p>
                    <p>Shehjar Complex</p>
                    <p>Inderhama, Burzahama, Srinagar,</p>
                    <p>Jammu & Kashmir - 190006</p>
                    <p>
                      <span className="font-semibold">Web:</span>{" "}
                      www.shehjar.co.in
                    </p>
                    <p>
                      <span className="font-semibold">Ph:</span> 7889-771-848 ||
                      7006-722-775
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

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
    </div>
  );
};

export default RefundPolicy;
