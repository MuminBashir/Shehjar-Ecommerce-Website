import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsList } from "react-icons/bs";
import { Sidebar, Logo, Cart_Button } from "../components";
import { useProductsContext } from "../context/product/products_context";
import { navLinks } from "../utils/constants";
import SearchBar from "./Searchbar";

const Navbar = () => {
  const { openSidebar, isSidebarOpen } = useProductsContext();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-50 w-full bg-white shadow transition-transform duration-300
    ${
      isSidebarOpen
        ? "hidden md:block"
        : showNavbar
        ? "translate-y-0"
        : "-translate-y-full"
    }
  `}
      >
        <div className="py-4 xl:py-8">
          <div className="container mx-auto flex flex-col items-center justify-center space-y-4 px-5 sm:space-y-4 md:flex-row md:justify-between md:space-y-0 xl:max-w-screen-xl xl:px-28">
            {/* Logo */}
            <div className="flex w-full items-center justify-between md:w-auto">
              <Logo className="text-3xl" />
              {/* Mobile: Left side buttons and Menu button */}
              <div className="flex items-center gap-4 md:hidden">
                {/* Cart + Login (left side) */}
                <Cart_Button />
                {/* Menu button (rightmost) */}
                <button
                  type="button"
                  aria-label="Open Sidebar"
                  onClick={openSidebar}
                  className="border border-black p-1 hover:border-primary hover:bg-primary hover:text-white"
                >
                  <BsList className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Menu and Search */}
            <div className="hidden flex-wrap items-center justify-center gap-6 text-sm uppercase md:flex md:justify-start lg:gap-10">
              <SearchBar />
              {navLinks.map(({ id, title, url }) => (
                <Link
                  key={id}
                  to={url}
                  className="group relative text-sm uppercase text-gray-800 transition-colors duration-200 hover:text-primary"
                >
                  {title}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 origin-left scale-x-0 bg-primary transition-all duration-300 group-hover:w-full group-hover:scale-x-100"></span>
                </Link>
              ))}
            </div>

            {/* Cart on desktop */}
            <div className="hidden md:flex">
              <Cart_Button />
            </div>

            {/* Mobile Search */}
            <div className="w-full pt-3 md:hidden">
              <SearchBar />
            </div>
          </div>
        </div>
      </nav>

      {/* Push content down so it doesn't get hidden behind fixed navbar */}
      <div className="h-[96px] md:h-[112px]" />

      {isSidebarOpen && <Sidebar />}
    </>
  );
};

export default Navbar;
