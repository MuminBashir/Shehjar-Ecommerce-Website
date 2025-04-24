import React from "react";
import { Link } from "react-router-dom";
import shehjarlogo from "../assets/shehjarlogo.png";

const Logo = ({ className }) => {
  return (
    <Link to="/">
      <h1
        className={`relative flex pr-3 font-extrabold tracking-widest  text-black md:text-3xl ${className} `}
      >
        <img
          src={shehjarlogo}
          alt="Shehjar"
          className="w-[80px] md:w-[120px]"
        />
      </h1>
    </Link>
  );
};

export default Logo;
