import React, { useEffect } from "react";
import { Breadcrumb } from "../../components";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mt-20">
      <Breadcrumb title="About Us" />
      <div className="container mx-auto px-5 py-10 xl:px-28">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold tracking-wider text-primary">
              Our Story
            </h1>
            <p className="font-light leading-relaxed text-gray-600">
              <span>
                Shehjar<sup>TM</sup>
              </span>{" "}
              is more than just a brand — it is a celebration of Kashmir’s rich
              artistic heritage and a commitment to social empowerment. As a
              registered trade name under{" "}
              <span className="font-bold">M/S Shehjar</span>, we are a women-led
              social enterprise dedicated to preserving the timeless beauty of
              Kashmiri handicrafts and art products. Our artisans, primarily
              women from poor and marginalized communities, are at the heart of
              everything we do.
            </p>
            <p className="font-light leading-relaxed text-gray-600">
              Through fair wages, skill development, and direct market access
              via online sales, exhibitions, retail stores, and international
              fairs, Shehjar empowers these talented craftswomen while ensuring
              that the legacy of Kashmir’s art lives on. For nearly a decade,
              our products — each telling a story of tradition, resilience, and
              artistry — have reached homes across the globe.
            </p>
            <p className="font-light leading-relaxed text-gray-600">
              At Shehjar, we weave dignity into every thread, carve pride into
              every motif, and connect you with the soul of Kashmir — one
              handcrafted piece at a time.
            </p>
          </div>
          <div className="relative h-80 overflow-hidden rounded-lg bg-gray-100 md:h-auto">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Image placeholder - artisan workshop
            </div>
          </div>
        </div>

        <div className="my-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-8 shadow-sm">
            <h3 className="mb-4 text-xl font-medium text-primary">
              Our Mission
            </h3>
            <p className="font-light text-gray-600">
              To create sustainable livelihoods for Kashmiri artisans by
              connecting them with global markets while preserving traditional
              craft techniques.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-8 shadow-sm">
            <h3 className="mb-4 text-xl font-medium text-primary">
              Our Vision
            </h3>
            <p className="font-light text-gray-600">
              A world where cultural heritage is valued and artisans thrive
              through fair trade practices and appreciation of traditional
              craftsmanship.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-8 shadow-sm">
            <h3 className="mb-4 text-xl font-medium text-primary">
              Our Values
            </h3>
            <p className="font-light text-gray-600">
              Authenticity, sustainability, fair trade, and community
              empowerment drive everything we do at Shehjar.
            </p>
          </div>
        </div>

        <div className="mt-16 mb-10">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-wider text-primary">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full bg-gray-100">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Image placeholder
                </div>
              </div>
              <h3 className="text-lg font-medium">Mr. XYZ</h3>
              <p className="text-gray-500">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full bg-gray-100">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Image placeholder
                </div>
              </div>
              <h3 className="text-lg font-medium">Ms. ABC</h3>
              <p className="text-gray-500">Creative Director</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-48 w-48 overflow-hidden rounded-full bg-gray-100">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Image placeholder
                </div>
              </div>
              <h3 className="text-lg font-medium">Mr. LMN</h3>
              <p className="text-gray-500">Artisan Relations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
