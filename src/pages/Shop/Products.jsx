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
      <section className="relative mx-auto my-10 flex max-w-full px-5 md:px-20">
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
