import React, { useEffect } from "react";
import { Breadcrumb } from "../../components";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
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
    <div className="mt-32 md:mt-28">
      <Breadcrumb title="Privacy Policy" />
      <motion.div
        className="container mx-auto px-5 py-10 xl:px-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={childVariants}>
          <h1 className="mb-8 text-3xl font-semibold tracking-wider text-primary">
            Privacy Policy
          </h1>

          <div className="mb-4 border-l-4 border-primary bg-primary/5 p-4 text-gray-700">
            <p className="font-medium">Effective Date: 01-05-2025</p>
            <p className="mt-2">
              This Privacy Policy applies to the website www.shehjar.co.in (the
              "Website") operated by M/S Shehjar ("we," "our," or "us").
            </p>
          </div>

          <div className="space-y-8 font-light leading-relaxed text-gray-700">
            <p>
              Your privacy is important to us. This policy outlines how we
              collect, use, disclose, and safeguard your personal information
              when you visit or make a purchase from our Website. By using this
              Website, you consent to the practices described in this policy.
            </p>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Information We Collect
              </h2>
              <p>
                We may collect the following types of information when you visit
                our Website, create an account, place an order, or interact with
                us:
              </p>

              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">
                    a. Personal Information:
                  </h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Full Name</li>
                    <li>Billing and Shipping Address</li>
                    <li>Email Address</li>
                    <li>Phone Number</li>
                    <li>
                      Payment details (handled via secure payment gateway; we do
                      not store credit/debit card details)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800">
                    b. Non-Personal Information:
                  </h3>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>IP Address</li>
                    <li>Browser type and version</li>
                    <li>Device type and operating system</li>
                    <li>
                      Website usage statistics and browsing patterns (through
                      cookies or analytics tools)
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                How We Use Your Information
              </h2>
              <p>We use your information to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Process and fulfill orders</li>
                <li>Communicate order status and customer support</li>
                <li>Personalize your shopping experience</li>
                <li>Improve our Website and services</li>
                <li>
                  Prevent fraudulent transactions and ensure Website security
                </li>
                <li>
                  Send marketing emails or newsletters (only with your consent)
                </li>
              </ul>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Sharing of Your Information
              </h2>
              <p>
                We do not sell or rent your personal information to third
                parties.
              </p>
              <p>We may share your information with:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  Trusted third-party service providers (e.g., logistics
                  partners, payment gateways) only to the extent necessary to
                  fulfill your order or provide services.
                </li>
                <li>
                  Legal or regulatory authorities if required by law or to
                  protect the rights and safety of Shehjar, its customers, or
                  others.
                </li>
              </ul>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Data Security
              </h2>
              <p>
                We implement appropriate physical, electronic, and managerial
                procedures to safeguard and secure your personal data. Your
                payment information is encrypted and processed via secure
                payment gateways compliant with industry standards (e.g., PCI
                DSS).
              </p>
              <p>
                However, no method of transmission over the Internet is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Cookies and Tracking Technologies
              </h2>
              <p>We use cookies and similar technologies to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Enhance user experience</li>
                <li>Remember your preferences</li>
                <li>
                  Collect Website usage data for analytics and performance
                  improvement
                </li>
              </ul>
              <p>
                You can choose to disable cookies through your browser settings,
                but some features of the Website may not function properly as a
                result.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Third-Party Links
              </h2>
              <p>
                Our Website may contain links to external websites or services.
                We are not responsible for the privacy practices or content of
                those third-party websites. We encourage you to review their
                privacy policies independently.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Children's Privacy
              </h2>
              <p>
                We do not knowingly collect personal information from
                individuals under the age of 13. If we become aware that we have
                inadvertently collected such information, we will take
                appropriate steps to delete it.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">Your Rights</h2>
              <p>You may:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Request access to the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
              <p>
                For any of these requests, please contact us using the details
                provided below.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Updates to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, or legal requirements. Any
                updates will be posted on this page with a revised "Effective
                Date."
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy
                or your personal information, please contact us:
              </p>
              <p>Email: info@shehjar.co.in</p>
              <div className="mt-4">
                <p className="font-medium">Address:</p>
                <p>Shehjar Complex</p>
                <p>Inderhama, Burzahama, Srinagar,</p>
                <p>Jammu & Kashmir - 190006</p>
                <p>Email: info@shehjar.co.in</p>
                <p>Web: www.shehjar.co.in</p>
                <p>Ph: 7889-771-848 || 7006-722-775</p>
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

export default PrivacyPolicy;
