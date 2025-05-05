import React from "react";
import Empty_Search_Engine from "../assets/undraw_search_engine.svg";
import { Link } from "react-router-dom";

const Empty_product = () => {
  return (
    <section className="my-10 grid place-items-center  ">
      <img src={Empty_Search_Engine} alt="" className=" w-72  " />
      <div className=" my-10 flex flex-col items-center justify-center ">
        <h3 className=" text-2xl font-medium "> No products found! </h3>
        <p className=" text-md mt-4 text-center text-gray-700 ">
          Looks like no products are available in this category.
        </p>
        <Link
          to="/shop"
          className=" mt-10 border border-primary px-16 py-2 font-medium uppercase text-primary hover:bg-green-100/50  "
        >
          {" "}
          All Products{" "}
        </Link>
      </div>
    </section>
  );
};

export default Empty_product;
