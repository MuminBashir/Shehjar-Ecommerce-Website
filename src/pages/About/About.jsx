import React, { useEffect, useState } from "react";
import { Breadcrumb } from "../../components";
import ceoImg from "../../assets/ceo.jpeg";
import operationsManagerImg from "../../assets/operationsManager.jpeg";
import executiveDirectorImg from "../../assets/executiveDirector.jpeg";
import artisanWorkshopImg from "../../assets/artisanWorkshop.jpeg";
import { X } from "lucide-react";

const TeamMemberPopup = ({ member, onClose }) => {
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOutsideClick}
    >
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full bg-gray-200 p-2 text-gray-600 hover:bg-gray-300"
        >
          <X size={24} />
        </button>

        {/* Fixed header with image and role - these won't scroll */}
        <div className="mb-4 flex flex-col items-center">
          <img
            src={member.image}
            alt={member.name}
            className="mb-4 h-32 w-32 rounded-full object-cover"
          />
          <h3 className="text-xl font-bold">{member.name}</h3>
          <p className="font-medium text-primary">{member.role}</p>
        </div>

        {/* Scrollable bio section */}
        <div className="mt-2 overflow-y-auto pr-2">
          <p className="text-justify text-gray-600">{member.bio}</p>
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Assma W. Qureshi",
      role: "Co-founder & CEO",
      image: ceoImg,
      bio: "Assma W. Qureshi, the Managing Director of Shehjar, is a passionate and visionary leader who has dedicated her life to the revival and global recognition of Kashmir's rich artisanal heritage. Holding a postgraduate degree in Literature and having spent many years working with humanitarian aid and development organizations, Assma brings a unique blend of empathy, insight, and purpose to her role. During her tenure with HELP (Human Effort for Love and Peace), one of Kashmir's most respected NGOs, she witnessed the deep scars left by conflict, disease, and social adversity—especially on women who had lost their families and livelihoods. Moved by their resilience and stories, Assma envisioned a platform that could empower these women through dignified, skilled work rooted in Kashmir's cultural identity. This vision led her to adopt Shehjar as her life's mission. Under her dedicated leadership, Shehjar has grown into an internationally recognized brand within just five to six years, offering not only exquisite Kashmiri crafts to global clientele but also a livelihood and voice to the women behind each piece.",
    },
    {
      id: 2,
      name: "Insha Hamid",
      role: "Executive Director - Finance & Sales",
      image: executiveDirectorImg,
      bio: "Insha Hamid brings a unique blend of strategic insight and human understanding to her role as Executive Director of Finance and Sales at Shehjar. With a Postgraduate degree in Psychology and over six years of hands-on experience in sales, Insha has consistently driven Shehjar's commercial growth while ensuring a deep connection with its customer base. Her journey with Shehjar spans several years, during which she has been instrumental in shaping the brand's market presence and financial structure. Insha's strong psychological acumen helps her anticipate consumer behavior, refine sales strategies, and build lasting customer relationships that reflect the authenticity and cultural essence of Shehjar. In addition to overseeing financial planning and sales operations, Insha plays a key role in product development cycles, pricing strategy, and retail expansion— anchoring Shehjar's vision of bringing Kashmir's timeless artistry to the global stage with economic sustainability and business resilience.",
    },
    {
      id: 3,
      name: "Rubby Jan",
      role: "Sr. Manager - Operations",
      image: operationsManagerImg,
      bio: "Rubby Jan serves as the Operations Manager for the Shehjar Food Centre and is widely regarded as the backbone of its processing operations. With over eight years of dedicated service and a strong technical background, she holds specialized certification in food processing and brings hands-on expertise to every aspect of the unit's functioning. Rubby is responsible for managing the entire inventory at the Shehjar Complex, ensuring seamless coordination between procurement, processing, and dispatch. Her deep understanding of food safety, quality standards, and operational efficiency has been critical in upholding Shehjar's commitment to excellence and authenticity in its food products.",
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openPopup = (member) => {
    setSelectedMember(member);
  };

  const closePopup = () => {
    setSelectedMember(null);
  };

  return (
    <div className="mt-32 md:mt-28">
      <Breadcrumb title="About Us" />
      <div className="container mx-auto px-5 py-10 xl:px-28">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-6 text-justify">
            <h1 className="text-3xl font-semibold tracking-wider text-primary">
              Our Story
            </h1>
            <p className="font-light leading-relaxed text-gray-600">
              <span>
                Shehjar<sup>TM</sup>
              </span>{" "}
              is more than just a brand — it is a celebration of Kashmir's rich
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
              that the legacy of Kashmir's art lives on. For nearly a decade,
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
            <img src={artisanWorkshopImg} alt="Shehjar Workhop" />
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
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div
                  className="mx-auto mb-4 h-48 w-48 cursor-pointer overflow-hidden rounded-full bg-gray-100 transition-transform hover:scale-105"
                  onClick={() => openPopup(member)}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-medium">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedMember && (
        <TeamMemberPopup member={selectedMember} onClose={closePopup} />
      )}
    </div>
  );
};

export default About;
