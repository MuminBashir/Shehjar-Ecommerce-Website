import React from "react";
import { BsTelephone, BsBuilding } from "react-icons/bs";
import {
  AiOutlineFacebook,
  AiFillTwitterSquare,
  AiOutlineLinkedin,
  AiOutlineInstagram,
} from "react-icons/ai";
import { FiMail } from "react-icons/fi";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Footer = () => {
  // Fetch top 3 artisans from Firestore, ordered by created_at (newest first)
  const [artisansSnapshot, loading, error] = useCollection(
    query(collection(db, "artisans"), orderBy("created_at", "desc"), limit(3))
  );

  return (
    <>
      <footer className="container mx-auto mt-28 grid grid-cols-1 space-y-10 bg-primary px-5 py-8 tracking-wider text-white md:mt-28 md:grid-cols-4 md:space-y-0 xl:px-28 xl:py-20 ">
        {/* Shoptik */}
        <section className="space-y-4">
          <h1 className="text-4xl font-black tracking-wider">Shehjar.</h1>
          <p className="w-2/3 text-sm font-light">
            Explore the various kind of products crafted from the valley of
            kashmir.
          </p>
        </section>

        {/* Contact us */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="uppercase ">Contact us</h2>
            <div className="w-1/6 border-t"></div>
          </div>
          <div className="space-y-4 text-sm font-light">
            <p className="flex items-center space-x-1">
              <span>
                {" "}
                <BsTelephone />{" "}
              </span>
              <span> (+88) 1234 567898</span>
            </p>
            <p className="flex items-center space-x-1">
              <span>
                {" "}
                <FiMail />{" "}
              </span>
              <span> info@shehjar.com</span>
            </p>
            <p className="flex items-center space-x-1">
              <span>
                {" "}
                <BsBuilding />{" "}
              </span>
              <span> Srinagar, Kashmir 190001</span>
            </p>
            <div className="flex space-x-6">
              <a href="#" aria-label="Facebook">
                <AiOutlineFacebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter">
                <AiFillTwitterSquare className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <AiOutlineLinkedin className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram">
                <AiOutlineInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Useful links */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="uppercase ">Userful links</h2>
            <div className="w-1/6 border-t"></div>
          </div>
          <div className="flex flex-col space-y-4 text-sm font-light">
            <a href="/about" className="hover:text-white/80">
              About Shehjar
            </a>
            <a href="/contact" className="hover:text-white/80">
              Contact us
            </a>
            <a href="/terms-and-conditions" className="hover:text-white/80">
              Terms and Conditions
            </a>
            <a href="/privacy-policy" className="hover:text-white/80">
              Privacy Policy
            </a>
            <a href="/shipping-policy" className="hover:text-white/80">
              Shipping and Return Policy
            </a>
          </div>
        </section>

        {/* Artisan Stories section */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="uppercase ">Artisan Stories</h2>
            <div className="w-1/6 border-t"></div>
          </div>
          <div className="flex flex-col space-y-3 font-light">
            {loading ? (
              <p className="text-sm">Loading artisan stories...</p>
            ) : error ? (
              <p className="text-sm">Error loading stories</p>
            ) : (
              artisansSnapshot?.docs.map((doc) => {
                const artisan = doc.data();
                return (
                  <article
                    key={doc.id}
                    className="flex items-center justify-start space-x-4 md:flex-col md:items-start md:space-x-0 lg:flex-row lg:items-center xl:space-x-4"
                  >
                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden">
                      <img
                        src={artisan.image}
                        alt={artisan.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="capitalize">
                      <Link
                        to={`/artisan/${doc.id}`}
                        className="text-sm hover:text-white/80"
                      >
                        {artisan.name}
                      </Link>
                      <p className="text-xs text-gray-200">
                        {artisan.created_at
                          ? format(artisan.created_at.toDate(), "d MMM, yyyy")
                          : ""}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </footer>
    </>
  );
};

export default Footer;
