import React from "react";
import {
  Breadcrumb,
  Filters,
  AllProducts,
  Sidebar_Filter,
} from "../../components";

const Products = () => {
  return (
    <div className="mt-32 md:mt-28">
      <Breadcrumb title="products" />
      <section className="container relative mx-auto my-10 flex  px-5 ">
        <Filters />
        <div className="w-full space-y-8 font-light  ">
          <AllProducts />
        </div>
        <Sidebar_Filter />
      </section>
    </div>
  );
};

export default Products;
