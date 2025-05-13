import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useSale } from "../../../context/sale/sale_context";
import ProductImageCarousel from "../ProductImageCarousel/ProductImageCarousel";
import ProductReview from "../../../components/ProductReview";
import { AddToCart } from "../../../components";
import { Rating } from "react-simple-star-rating";
import { IndianRupee, ChevronDown, ChevronUp } from "lucide-react";
import GenreList from "../../../components/GenreList";
import { FiExternalLink } from "react-icons/fi";

// GI Certified Seal Component
const GICertifiedSeal = () => (
  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-800 bg-white shadow-lg">
    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-red-800">
      <span
        className="text-center text-xs font-bold text-red-800"
        style={{ fontSize: "0.45rem", lineHeight: "0.6rem" }}
      >
        GI
      </span>
      <span
        className="text-center text-xs font-bold text-red-800"
        style={{ fontSize: "0.45rem", lineHeight: "0.6rem" }}
      >
        CERTIFIED
      </span>
    </div>
  </div>
);

// Sale Badge Component
const SaleBadge = ({ discountPercentage }) => (
  <div className="ml-3 flex items-center rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">
    {discountPercentage}% OFF
  </div>
);

const SingleProduct = () => {
  const { id } = useParams();
  const { currentSale, hasActiveSale } = useSale();
  const [product, loading, error] = useDocument(doc(db, "products", id));
  const [artisan, artisanLoading, artisanError] = useDocument(
    product?.data()?.artisan_id
      ? doc(db, "artisans", product.data().artisan_id)
      : null
  );

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);

  // States for collapsible sections
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [artisanOpen, setArtisanOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product && product.exists()) {
      const productData = product.data();

      const { combinations = [], sizes = [], colors = [] } = productData;

      // Try to find the first in-stock combination
      const availableCombo = combinations.find((combo) => combo.quantity > 0);

      if (availableCombo) {
        setSelectedSize(availableCombo.size);
        setSelectedColor(availableCombo.color);
      } else {
        // No stock: default to first combination if available
        if (combinations.length > 0) {
          setSelectedSize(combinations[0].size);
          setSelectedColor(combinations[0].color);
        } else {
          // fallback if combinations are missing
          if (sizes.length > 0) setSelectedSize(sizes[0]);
          if (colors.length > 0) setSelectedColor(colors[0]);
        }
      }
    }
  }, [product]);

  useEffect(() => {
    if (product && product.exists() && selectedSize && selectedColor) {
      const productData = product.data();
      const combination = productData.combinations.find(
        (combo) => combo.size === selectedSize && combo.color === selectedColor
      );

      setAvailableQuantity(combination ? combination.quantity : 0);
    }
  }, [product, selectedSize, selectedColor]);

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.rate, 0);
    return sum / ratings.length;
  };

  if (loading)
    return (
      <div className="py-36 text-center md:py-32">
        Loading product details...
      </div>
    );
  if (error)
    return (
      <div className="py-36 text-center text-red-500 md:py-32">
        Error loading product: {error.message}
      </div>
    );
  if (!product || !product.exists())
    return (
      <div className="py-36 text-center md:py-32">
        <div className="text-2xl font-bold">Product not found.</div>
        <div className="mt-3 mb-5">
          The product you're looking for doesn't exist or has been removed
        </div>
        <Link
          to={"/shop"}
          className="inline-block rounded-md bg-primary px-6 py-3 text-white transition-colors hover:bg-opacity-90"
        >
          Browse All Products
        </Link>
      </div>
    );

  const productData = product.data();
  const averageRating = calculateAverageRating(productData.ratings);
  const totalRatings = productData.ratings ? productData.ratings.length : 0;

  // Check if this product is on sale
  const isOnSale =
    hasActiveSale &&
    currentSale?.product_ids?.includes(id) &&
    currentSale?.discount_percentage > 0;

  // Calculate the discounted price if the product is on sale
  // Using Math.floor to round down to integer
  const discountPercentage = isOnSale ? currentSale.discount_percentage : 0;
  const discountedPrice = isOnSale
    ? Math.floor(
        productData.price - productData.price * (discountPercentage / 100)
      )
    : productData.price;

  const setColour = (color) => {
    setSelectedColor(color);
  };

  const setSize = (size) => {
    setSelectedSize(size);
  };

  return (
    <div className="container mx-auto px-4 pt-36 md:pt-32">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Product Images */}
        <div className="md:w-1/2">
          <ProductImageCarousel images={productData.images || []} />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <h1 className="font-serif text-3xl font-bold">
              {productData.name}
            </h1>
            {productData.is_certified && <GICertifiedSeal />}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex items-center">
              <Rating
                initialValue={Number(averageRating)}
                size={22}
                readonly
                allowFraction
                SVGstyle={{ display: "inline-block" }}
                fillColor="#FFDF00"
              />
            </div>
            <span className="text-sm text-gray-600">
              {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
            </span>
          </div>

          <div className="mt-4">
            {isOnSale ? (
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold text-primary">
                  <IndianRupee size={20} className="inline text-primary" />
                  {discountedPrice.toLocaleString()}
                </p>
                <p className="text-lg text-gray-500 line-through">
                  <IndianRupee size={16} className="inline text-gray-500" />
                  {productData.price.toLocaleString()}
                </p>
                <SaleBadge discountPercentage={discountPercentage} />
              </div>
            ) : (
              <p className="text-2xl font-semibold">
                <IndianRupee size={20} className="inline" />
                {productData.price.toLocaleString()}
              </p>
            )}
            {/* Fixed the nesting issue here */}
            <div className="mt-1 flex gap-1 text-sm text-gray-600">
              Tax included{" "}
              <span>
                <Link
                  to="/shipping-policy"
                  className="text-primary underline hover:no-underline"
                >
                  Shipping
                </Link>
              </span>{" "}
              calculated at checkout
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            {productData.sizes && productData.sizes.length > 1 && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium">Size</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={selectedSize}
                  onChange={(e) => setSize(e.target.value)}
                >
                  {productData.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div className="mt-4">
            {productData.colors && productData.colors.length > 1 && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Color</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={selectedColor}
                  onChange={(e) => setColour(e.target.value)}
                >
                  {productData.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Add to Cart Component */}
          <AddToCart
            productId={id}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            availableQuantity={availableQuantity}
            productName={productData.name}
            productImage={productData.images ? productData.images[0] : ""}
            productPrice={isOnSale ? discountedPrice : productData.price}
          />

          {/* Return Policy */}
          <div className="mt-4">
            <p className="text-md text-gray-600 ">{productData.returnPolicy}</p>
          </div>

          {/* Collapsible Size Chart */}
          {productData.size_chart && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <button
                className="flex w-full items-center justify-between py-2"
                onClick={() => setSizeChartOpen(!sizeChartOpen)}
              >
                <h3 className="text-xl font-semibold">Size Chart</h3>
                {sizeChartOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {sizeChartOpen && (
                <div className="mt-2">
                  <img
                    src={productData.size_chart}
                    alt="Size Chart"
                    className="w-full max-w-md rounded border"
                  />
                </div>
              )}
            </div>
          )}

          {/* Collapsible Product Description */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button
              className="flex w-full items-center justify-between py-2"
              onClick={() => setDescriptionOpen(!descriptionOpen)}
            >
              <h3 className="text-xl font-semibold">Description</h3>
              {descriptionOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {descriptionOpen && (
              <div
                className="mt-2 text-gray-700"
                dangerouslySetInnerHTML={{ __html: productData.description }}
              />
            )}
          </div>

          {/* Collapsible Shipping Info */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button
              className="flex w-full items-center justify-between py-2"
              onClick={() => setShippingOpen(!shippingOpen)}
            >
              <h3 className="text-xl font-semibold">Shipping & Returns</h3>
              {shippingOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {shippingOpen && (
              <div className="mt-2 space-y-4 text-gray-700">
                {productData.returnPolicy && (
                  <div>
                    <h4 className="mb-2 font-medium">Return Policy:</h4>
                    <p className="mb-2 text-sm">{productData.returnPolicy}</p>
                    <p className="mb-3 text-sm">
                      Returns and exchanges are accepted within{" "}
                      <span className="font-medium">3 days</span> of delivery.
                      <Link
                        to="/refund-policy"
                        className="ml-1 text-primary hover:underline"
                      >
                        View our complete return policy
                      </Link>
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 font-medium">Shipping Information:</h4>
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    <li>
                      <span className="font-medium">Processing time:</span> 3-7
                      business days as our products are handmade
                    </li>
                    <li>
                      <span className="font-medium">Domestic delivery:</span>{" "}
                      5-10 business days after dispatch
                    </li>
                    <li>
                      <span className="font-medium">Free shipping</span> on
                      domestic orders above a certain amount (see shipping
                      policy)
                    </li>
                    <li>
                      <span className="font-medium">
                        International shipping
                      </span>{" "}
                      available with longer delivery times (10-20 business days)
                    </li>
                    <li>
                      You'll receive{" "}
                      <span className="font-medium">tracking information</span>{" "}
                      via email once your order ships
                    </li>
                  </ul>

                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <div className="flex items-center">
                      <Link
                        to="/shipping-policy"
                        className="flex items-center font-medium text-primary hover:underline"
                      >
                        View our complete shipping policy
                        <FiExternalLink className="ml-1" size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Artisan Card */}
          {productData.artisan_id && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <button
                className="flex w-full items-center justify-between py-2"
                onClick={() => setArtisanOpen(!artisanOpen)}
              >
                <h3 className="text-xl font-semibold">Meet the Artisan</h3>
                {artisanOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {artisanOpen && (
                <div className="mt-3">
                  {artisanLoading ? (
                    <p>Loading artisan information...</p>
                  ) : artisanError ? (
                    <p className="text-red-500">
                      Error loading artisan details
                    </p>
                  ) : artisan && artisan.exists() ? (
                    <Link to={`/artisan/${productData.artisan_id}`}>
                      <div className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                        {artisan.data().image && (
                          <div className="mr-4 h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
                            <img
                              src={artisan.data().image}
                              alt={artisan.data().name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{artisan.data().name}</h4>
                          {artisan.data().location && (
                            <p className="text-sm text-gray-600">
                              {artisan.data().location}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p>Artisan information not available</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Reviews Section */}
      <ProductReview
        productId={id}
        productRatings={productData.ratings || []}
      />

      {/* Product Recommendaiton */}
      <div className="my-16 flex flex-col gap-6">
        <GenreList genre="Recommended" title="RECOMMENDED PRODUCTS" />
        <GenreList genre="BestSeller" title="BEST SELLERS" />
      </div>
    </div>
  );
};

export default SingleProduct;
