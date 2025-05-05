import React from "react";
import Empty_Order from "../assets/undraw_empty_order.jpg";
import { Link } from "react-router-dom";

const Empty_order = () => {
  return (
    <section className="my-10 grid place-items-center  ">
      <img src={Empty_Order} alt="" className=" w-72 " />
      <div className=" my-10 flex flex-col items-center justify-center ">
        <h3 className=" text-2xl font-medium "> No orders found! </h3>
        <p className=" text-md mt-4 text-center text-gray-700 ">
          Looks like you haven't placed any orders yet.
        </p>
        <Link
          to="/shop"
          className=" mt-10 border border-primary px-16 py-2 font-medium uppercase text-primary hover:bg-green-100/50  "
        >
          {" "}
          Browse Products{" "}
        </Link>
      </div>
    </section>
  );
};

export default Empty_order;
