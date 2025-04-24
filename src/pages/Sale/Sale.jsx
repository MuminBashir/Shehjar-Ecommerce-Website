import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSale } from "../../context/sale/sale_context";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";

const SalePage = () => {
  const { currentSale, hasActiveSale, isLoading: saleLoading } = useSale();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Effect to check if sale is active
  useEffect(() => {
    if (!saleLoading && !hasActiveSale) {
      navigate("/shop"); // Redirect to shop if no active sale
    }
  }, [hasActiveSale, saleLoading, navigate]);

  // Effect to fetch products when sale data is available
  useEffect(() => {
    const fetchSaleProducts = async () => {
      if (
        !currentSale ||
        !currentSale.product_ids ||
        currentSale.product_ids.length === 0
      ) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Firestore doesn't support a direct "IN" query with a large array
        // So we'll fetch each product individually and combine them
        const productPromises = currentSale.product_ids.map(
          async (productId) => {
            const productDoc = await getDocs(
              query(collection(db, "products"), where("id", "==", productId))
            );

            if (!productDoc.empty) {
              const productData = productDoc.docs[0].data();
              return { ...productData };
            }
            return null;
          }
        );

        const productsData = await Promise.all(productPromises);
        const validProducts = productsData.filter(
          (product) => product !== null
        );
        setProducts(validProducts);
      } catch (error) {
        console.error("Error fetching sale products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentSale && hasActiveSale) {
      fetchSaleProducts();
    }
  }, [currentSale, hasActiveSale]);

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (saleLoading || loading) {
    return (
      <div className="mt-20 flex h-96 items-center justify-center">
        <div className="text-xl">Loading sale...</div>
      </div>
    );
  }

  if (!hasActiveSale || !currentSale) {
    return (
      <div className="container mx-auto mt-20 px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">No Active Sale</h1>
          <p className="mb-6 text-gray-600">
            There is currently no active sale running.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            Visit Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-20 px-4 py-8">
      {/* Sale Banner - Modified to prevent image cutting */}
      <div className="relative mb-8 overflow-hidden rounded-lg">
        {currentSale.thumbnail_image ? (
          <div className="relative w-full">
            <img
              src={currentSale.thumbnail_image}
              alt={currentSale.title || "Sale"}
              className="w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                  {currentSale.title || "Special Sale"}
                </h1>
                <div className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-white">
                  {currentSale.discount_percentage}% OFF
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary/80 to-primary py-12 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              {currentSale.title || "Special Sale"}
            </h1>
            <div className="mt-4 inline-block rounded-full bg-white px-6 py-2 text-primary">
              {currentSale.discount_percentage}% OFF
            </div>
          </div>
        )}
      </div>

      {/* Product Count Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sale Products</h2>
        <span className="text-gray-600">
          {products.length} {products.length === 1 ? "product" : "products"} on
          sale
        </span>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-600">No sale products found.</p>
        </div>
      )}
    </div>
  );
};

export default SalePage;
