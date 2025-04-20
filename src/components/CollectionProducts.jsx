import React from "react";
import { ProductImage, Product_title } from "../components";

const CollectionProducts = ({ products, title }) => {
  return (
    <>
      <section className=" w-full md:space-y-4 ">
        <h2 className="pb-4 font-bold uppercase tracking-widest md:pb-0 ">
          {" "}
          {title}{" "}
        </h2>
        <hr className=" " />
        {products.slice(0, 3).map((product) => {
          const { id } = product;
          return (
            <div
              key={id}
              className=" group flex flex-row space-x-5 pt-8 md:pt-4  "
            >
              <ProductImage product={product} className="h-20 w-20 p-2 " />
              <Product_title product={product} />
            </div>
          );
        })}
      </section>
    </>
  );
};

export default CollectionProducts;
