import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/auth_context";
import { BsPersonCircle } from "react-icons/bs";
import { FiLogOut, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";

const UserBtn = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate("/");
      toast.success("Logged out successfully.");
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {currentUser ? (
        <button
          className="flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
        >
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || "User"}
              className="h-8 w-8 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <BsPersonCircle className="h-7 w-7 text-gray-700" />
          )}
        </button>
      ) : (
        <Link
          to="/login"
          className="flex items-center justify-center text-sm uppercase text-gray-800 transition-colors duration-200 hover:text-primary"
        >
          <span>Login</span>
        </Link>
      )}

      {isOpen && currentUser && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-800">
              {currentUser.displayName || "User"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {currentUser.email}
            </p>
          </div>
          <Link
            to="/profile"
            className="block flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <FiUser className="mr-2" /> Profile
          </Link>
          <button
            onClick={handleLogout}
            className="block flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserBtn;
