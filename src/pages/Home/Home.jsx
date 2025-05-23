import React, { Suspense, lazy } from "react";

import { Loading } from "../../components";

const Carousel = lazy(() => import("../../components/Carousel"));
const GenreList = lazy(() => import("../../components/GenreList"));
const CategoryList = lazy(() => import("../../components/CategoryList"));
const GenreBanner = lazy(() => import("../../components/GenreBanner"));
const VideoPromotion = lazy(() => import("../../components/VideoPromotion"));
const NewsLetterSubscribe = lazy(() =>
  import("../../components/NewsLetterSubscribe")
);
const SaleBanner = lazy(() => import("../../components/SaleBanner"));
const HomeProduct = lazy(() => import("../../components/HomeProduct"));
const BasketProduct = lazy(() => import("../../components/Basket"));
const Header = lazy(() => import("../../components/Header"));
const Instagram = lazy(() => import("../../components/Instagram"));
const ProductCategory = lazy(() => import("../../components/ProductCategory"));

const Home = () => {
  return (
    <div className="mt-32 md:mt-28">
      <Suspense fallback={<Loading />}>
        <div className="hidden md:block">
          <Carousel isMobile={false} />
        </div>
        <div className="md:hidden">
          <Carousel isMobile={true} />
        </div>
        <div className="mx-auto my-10 flex max-w-full flex-col gap-10 md:px-32">
          <SaleBanner />
          <GenreList genre="NewArrival" title="NEW ARRIVALS" />
          <GenreList genre="BestSeller" title="BEST SELLERS" />
          <CategoryList />
          <GenreBanner genre="Men" />
          <GenreBanner genre="Women" reverse={true} />
          <GenreBanner genre="Gift" />
          <VideoPromotion />
          <NewsLetterSubscribe />
        </div>
      </Suspense>
    </div>
  );
};

export default Home;
