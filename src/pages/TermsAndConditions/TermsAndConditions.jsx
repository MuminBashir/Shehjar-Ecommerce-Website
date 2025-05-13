import React, { useEffect } from "react";
import { Breadcrumb } from "../../components";
import { motion } from "framer-motion";

const TermsAndConditions = () => {
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
      <Breadcrumb title="Terms and Conditions" />
      <motion.div
        className="container mx-auto px-5 py-10 xl:px-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={childVariants}>
          <h1 className="mb-8 text-3xl font-semibold tracking-wider text-primary">
            Terms and Conditions
          </h1>

          <div className="space-y-8 font-light leading-relaxed text-gray-700">
            <p>
              The following rules and regulations contained in this document
              apply to all visitors and users of the Shehjar website
              (shehjar.co.in) (the "Website").
            </p>
            <p>
              The Shehjar website (shehjar.co.in) is operated by M/S Shehjar a
              social enterprise initiative based in Jammu and Kashmir, India. By
              using the Website, you accept and agree to be bound by these Terms
              and Conditions, as they may be updated from time to time and
              posted here without prior notice. You are advised to review these
              Terms periodically for any updates or changes.
            </p>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                About Shehjar<sup>TM</sup>
              </h2>
              <p>
                Shehjar is a community-first initiative committed to reviving
                Kashmiri traditional arts by offering handmade products created
                by women artisans, especially from poor and marginalized
                communities. Through this platform, we aim to provide dignified
                wages, preserve heritage craftsmanship, and connect the art of
                Kashmir to global markets.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Payment Gateway
              </h2>
              <p>
                "We as a merchant shall be under no liability whatsoever in
                respect of any loss or damage arising directly or indirectly out
                of the decline of authorization for any transaction, on account
                of the Cardholder having exceeded the preset limit mutually
                agreed by us with our acquiring bank from time to time."
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Content of the Website and Copyright Information
              </h2>
              <p>
                You agree not to reproduce, distribute, sell, trade, resell, or
                exploit for any commercial purposes the content of the Website.
              </p>
              <p>
                You also agree not to interfere with or disrupt the Website
                services, the security systems of the Website, or any Website
                content.
              </p>
              <p>
                All content available on the Website, including product images,
                designs, text, and logos, is the intellectual property of
                Shehjar<sup>TM</sup> or its associated artisans, and may be
                protected under applicable copyright and trademark laws.
              </p>
              <p>
                Some product photographs are for representation purposes only
                and may show additional accessories or elements that are not
                part of the standard product.
              </p>
              <p>
                Some products may show colour variations and may not resemble
                actual products due to colour decoding mechanism by your gadget.
              </p>
              <p>
                While every effort is made to ensure that information provided
                on the Website is accurate and up-to-date, we do not warrant
                that product descriptions or other content are error-free,
                complete, or current.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Your Account
              </h2>
              <p>
                Using certain services or sections of the Website may require
                you to create a user account.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your
                account information and password and agree to accept
                responsibility for all activities under your account.
              </p>
              <p>
                If you suspect any unauthorized use of your account, you must
                immediately notify the Website administrator at
                info@shehjar.co.in.
              </p>
              <p>
                Shehjar is not liable for any loss or damage arising from
                unauthorized account access.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Order Processing and Availability
              </h2>
              <p>
                All orders are subject to acceptance and availability. Due to
                the handmade nature of the products, some items may take longer
                to process and ship.
              </p>
              <p>
                Estimated shipping timelines will be provided during checkout.
              </p>
              <p>
                Shehjar reserves the right to cancel or refuse any order at our
                sole discretion, especially in case of suspected fraudulent
                activity or errors in pricing or product information.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Limitations of Liability
              </h2>
              <p>
                The Website and its operating organization shall not be held
                liable for any direct, indirect, incidental, special, or
                consequential damages arising from the use of or inability to
                use the Website, including but not limited to loss of profits,
                business interruption, data loss, or any other business damage.
              </p>
              <p>
                Your use of the Website is at your own risk. All materials and
                services are provided "as is" without warranty of any kind.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Availability of the Website
              </h2>
              <p>
                Shehjar.co.in reserves the right to terminate, suspend, or
                discontinue any part of the Website or the entire Website at any
                time, without prior notice.
              </p>
              <p>
                We may also modify or remove any part of the Website features,
                products, or content without liability.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">
                Governing Law and Jurisdiction
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the
                laws of the Union Territory of Jammu and Kashmir and the laws of
                India. Any disputes arising shall be subject to the exclusive
                jurisdiction of the courts in Srinagar, Jammu & Kashmir.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="space-y-4">
              <h2 className="text-2xl font-medium text-primary">Contact Us</h2>
              <p>
                If you have any questions or concerns regarding our Terms of
                Use, please contact us at:
              </p>
              <p>Email: info@shehjar.co.in</p>
              <div className="mt-4">
                <p className="font-medium">Office Address:</p>
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

export default TermsAndConditions;
