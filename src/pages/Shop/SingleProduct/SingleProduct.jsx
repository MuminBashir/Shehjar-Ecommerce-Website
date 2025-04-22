import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import ProductImageCarousel from "../ProductImageCarousel/ProductImageCarousel";
import ProductReview from "../../../components/ProductReview";
import { Rating } from "react-simple-star-rating";
import { IndianRupee, ChevronDown, ChevronUp } from "lucide-react";

const SingleProduct = () => {
  const { id } = useParams();
  const [product, loading, error] = useDocument(doc(db, "products", id));
  const [artisan, artisanLoading, artisanError] = useDocument(
    product?.data()?.artisan_id
      ? doc(db, "artisans", product.data().artisan_id)
      : null
  );

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // States for collapsible sections
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [artisanOpen, setArtisanOpen] = useState(false);

  useEffect(() => {
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

  const handleAddToCart = () => {
    if (availableQuantity > 0) {
      console.log("Adding to cart:", {
        productId: id,
        selectedSize,
        selectedColor,
        quantity: 1,
      });
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading product details...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading product: {error.message}
      </div>
    );
  if (!product || !product.exists())
    return <div className="p-8 text-center">Product not found</div>;

  const productData = product.data();
  const averageRating = calculateAverageRating(productData.ratings);
  const totalRatings = productData.ratings ? productData.ratings.length : 0;

  const setColour = (color) => {
    setSelectedColor(color);
    setQuantity(1);
  };

  const setSize = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Product Images */}
        <div className="md:w-1/2">
          <ProductImageCarousel images={productData.images || []} />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="font-serif text-3xl font-bold">{productData.name}</h1>

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
            <p className="text-2xl font-semibold">
              <IndianRupee size={20} className="inline" />
              {productData.price}
            </p>
            <p className="mt-1 flex gap-1 text-sm text-gray-600">
              Tax included{" "}
              <div>
                <Link
                  to="/shipping-policy"
                  className="text-primary underline hover:no-underline"
                >
                  Shipping
                </Link>
              </div>{" "}
              calculated at checkout
            </p>
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

          {/* Add to Cart */}
          {/* Quantity Selector and Add to Cart */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Quantity Selector */}
            <div className="flex w-full max-w-[120px] items-center justify-between rounded-md border border-gray-300 px-2 py-2">
              <button
                className="text-lg font-semibold text-gray-600 disabled:opacity-30"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="text-center font-medium">{quantity}</span>
              <button
                className="text-lg font-semibold text-gray-600 disabled:opacity-30"
                onClick={() =>
                  setQuantity((q) => Math.min(availableQuantity, q + 1))
                }
                disabled={quantity >= availableQuantity}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              className={`w-full rounded-md py-3 px-4 font-medium sm:w-auto ${
                availableQuantity > 0
                  ? "border border-primary bg-primary text-white transition-colors hover:bg-white hover:text-primary"
                  : "cursor-not-allowed bg-gray-300 text-gray-500"
              }`}
              onClick={handleAddToCart}
              disabled={availableQuantity <= 0}
            >
              {availableQuantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Availability */}
          <div className="mt-4">
            <p
              className={`${
                availableQuantity > 0 ? "text-green-600" : "text-red-600"
              } text-md`}
            >
              {availableQuantity > 0 ? `In stock` : "Currently out of stock"}
            </p>
          </div>

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
          <div className="mt-8 border-t border-gray-200 pt-4">
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
              <div className="mt-2 space-y-2 text-gray-700">
                {productData.returnPolicy && (
                  <div className="mt-4">
                    <h4 className="font-medium underline">
                      {productData.returnPolicy}
                    </h4>
                  </div>
                )}
                <h4 className="font-medium">Shipping Policy:</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Free shipping on orders above ₹1000</li>
                  <li>Delivery within 5-7 business days</li>
                  <li>Express shipping available at checkout</li>
                  <li>International shipping available to select countries</li>
                </ul>
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
    </div>
  );
};

export default SingleProduct;
