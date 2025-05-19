import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrders } from "../../../context/orders/order_context";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiBox,
  FiTruck,
  FiHome,
  FiXCircle,
  FiExternalLink,
  FiMail,
  FiRefreshCw,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import { Loading } from "../../../components";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/config";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { orders, loading } = useOrders();
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);

  // Calculate if the order is within 24 hours for cancellation eligibility
  const isWithin24Hours = (timestamp) => {
    if (!timestamp) return false;
    const orderDate = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - orderDate) / (1000 * 60 * 60);
    return diffInHours <= 12;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchOrderDetails = async () => {
      try {
        // First check if the order is already in the orders array
        const existingOrder = orders.find((o) => o.orderId === id);

        if (existingOrder) {
          setOrder(existingOrder);
          setOrderLoading(false);
          return;
        }

        // If not found in existing orders, fetch it directly using orderId
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("orderId", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
        setOrderLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setOrderLoading(false);
      }
    };

    if (!loading) {
      fetchOrderDetails();
    }
  }, [id, orders, loading]);

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calculate total items
  const getTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading || orderLoading) {
    return (
      <div className="container mx-auto mt-32 flex justify-center px-4 py-16 md:mt-28">
        <Loading />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto mt-32 max-w-screen-xl px-4 py-16 text-center md:mt-28">
        <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
        <p className="mb-8">We couldn't find the order you're looking for.</p>
        <Link
          to="/orders"
          className="hover:bg-primary-dark inline-block rounded bg-primary px-6 py-3 text-white transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Calculate if order can be cancelled (within 12 hours and status is "processing")
  const canBeCancelled =
    isWithin24Hours(order.createdAt) &&
    order.status.toLowerCase() === "processing";

  return (
    <div className="container mx-auto mt-32 max-w-screen-xl px-4 py-8 md:mt-28">
      <div className="mb-6 flex flex-col justify-center gap-5">
        <Link
          to="/orders"
          className="mr-4 flex items-center text-primary hover:underline"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Summary - Left Column */}
        <div className="lg:col-span-2">
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Order #{order.orderId}</h2>
                <div className="flex items-center">
                  <span className="mr-3 text-sm text-gray-600">
                    Placed on {formatDate(order.createdAt)}
                  </span>
                  {renderStatusBadge(order.status)}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex flex-wrap justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="mb-1 font-medium">Payment Information</h3>
                  <p className="text-sm text-gray-600">
                    Payment Method: {order.payment.method}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment ID: {order.payment.id}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      order.payment.status === "completed"
                        ? "bg-green-50 text-green-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-3 font-medium">
                  Order Items ({getTotalItems(order.items)} items)
                </h3>
                <div className="divide-y rounded-lg border border-gray-200">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex p-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between text-base">
                          <div>
                            <h4 className="font-medium text-gray-900 ">
                              {item.title}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.color} | {item.size} | Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ₹
                              {item.isOnSale
                                ? (
                                    item.discountedPrice * item.quantity
                                  ).toLocaleString()
                                : (item.price * item.quantity).toLocaleString()}
                            </p>
                            {item.isOnSale && (
                              <p className="text-sm text-gray-500">
                                <span className="line-through">
                                  ₹
                                  {(
                                    item.price * item.quantity
                                  ).toLocaleString()}
                                </span>
                                <span className="ml-2 text-green-600">
                                  {item.discountPercentage}% off
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-gray-50 px-6 py-4">
              <h2 className="font-semibold">Order Tracking</h2>
            </div>
            <div className="p-6">
              {(order.status === "shipped" || order.status === "delivered") &&
                order.trackingId && (
                  <div className="mb-4 rounded-lg bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-800">
                          Tracking Information
                        </h3>
                        <p className="hidden text-sm text-blue-600 md:block">
                          Tracking ID: {order.trackingId}
                        </p>
                      </div>
                      <a
                        href={`${order.trackingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200"
                      >
                        Track Order <FiExternalLink className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}

              {/* Order Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

                {/* Always show - Order Placed */}
                <div className="relative mb-6 pl-10">
                  <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <FiCheckCircle className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="flex items-center font-medium">
                      Order Placed
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Your order has been placed successfully
                    </p>
                  </div>
                </div>

                {/* Processing - active if status is processing or beyond */}
                <div className="relative mb-6 pl-10">
                  <div
                    className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${
                      ["processing", "shipped", "delivered"].includes(
                        order.status.toLowerCase()
                      )
                        ? "bg-green-100"
                        : order.status.toLowerCase() === "cancelled"
                        ? "bg-red-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {order.status.toLowerCase() === "cancelled" ? (
                      <FiXCircle className="text-red-600" />
                    ) : ["processing", "shipped", "delivered"].includes(
                        order.status.toLowerCase()
                      ) ? (
                      <FiCheckCircle className="text-green-600" />
                    ) : (
                      <FiBox className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-medium ${
                        ["processing", "shipped", "delivered"].includes(
                          order.status.toLowerCase()
                        )
                          ? ""
                          : order.status.toLowerCase() === "cancelled"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {order.status.toLowerCase() === "cancelled"
                        ? "Order Cancelled"
                        : "Processing"}
                      {(order.status.toLowerCase() === "processing" ||
                        order.status.toLowerCase() === "shipped" ||
                        order.status.toLowerCase() === "delivered") && (
                        <span className="ml-2 text-xs text-gray-500">
                          {formatDate(order.processedAt || order.createdAt)}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.status.toLowerCase() === "cancelled"
                        ? "Your order has been cancelled"
                        : "Your order is being processed"}
                    </p>
                  </div>
                </div>

                {/* Only show if not cancelled */}
                {order.status.toLowerCase() !== "cancelled" && (
                  <>
                    {/* Shipped - active if status is shipped or delivered */}
                    <div className="relative mb-6 pl-10">
                      <div
                        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${
                          ["shipped", "delivered"].includes(
                            order.status.toLowerCase()
                          )
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {["shipped", "delivered"].includes(
                          order.status.toLowerCase()
                        ) ? (
                          <FiCheckCircle className="text-green-600" />
                        ) : (
                          <FiTruck className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-medium ${
                            ["shipped", "delivered"].includes(
                              order.status.toLowerCase()
                            )
                              ? ""
                              : "text-gray-500"
                          }`}
                        >
                          Shipped
                          {(order.status.toLowerCase() === "shipped" ||
                            order.status.toLowerCase() === "delivered") && (
                            <span className="ml-2 text-xs text-gray-500">
                              {formatDate(order.shippedAt || order.createdAt)}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your order is on the way
                        </p>
                      </div>
                    </div>

                    {/* Delivered - active if status is delivered */}
                    <div className="relative pl-10">
                      <div
                        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${
                          order.status.toLowerCase() === "delivered"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {order.status.toLowerCase() === "delivered" ? (
                          <FiCheckCircle className="text-green-600" />
                        ) : (
                          <FiHome className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-medium ${
                            order.status.toLowerCase() === "delivered"
                              ? ""
                              : "text-gray-500"
                          }`}
                        >
                          Delivered
                          {order.status.toLowerCase() === "delivered" && (
                            <span className="ml-2 text-xs text-gray-500">
                              {formatDate(order.deliveredAt || order.createdAt)}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your order has been delivered
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* NEW SECTION: Cancellation and Return Information */}
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-gray-50 px-6 py-4">
              <h2 className="font-semibold">Help with Your Order</h2>
            </div>
            <div className="p-6">
              {/* Cancellation Information */}
              <div className="mb-6">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0">
                    <FiClock className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-medium">
                      Order Cancellation
                    </h3>
                    {canBeCancelled ? (
                      <div className="mb-3 rounded-md bg-green-50 p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiCheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                              Your order is eligible for cancellation
                            </p>
                            <p className="mt-1 text-sm text-green-700">
                              You can cancel this order within 12 hours of
                              placing it (until{" "}
                              {formatDate(
                                new Date(
                                  order.createdAt.toDate
                                    ? order.createdAt.toDate().getTime() +
                                      12 * 60 * 60 * 1000
                                    : new Date(order.createdAt).getTime() +
                                      12 * 60 * 60 * 1000
                                )
                              )}
                              ).
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 rounded-md bg-gray-50 p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FiAlertCircle className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-800">
                              {order.status.toLowerCase() === "cancelled"
                                ? "This order has already been cancelled."
                                : ["shipped", "delivered"].includes(
                                    order.status.toLowerCase()
                                  )
                                ? "This order cannot be cancelled as it has already been shipped."
                                : "This order is no longer eligible for cancellation (12-hour window has passed)."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="mb-3 text-sm text-gray-600">
                      To cancel your order, please contact us through one of the
                      following methods:
                    </p>
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      <a
                        href="mailto:info@shehjar.co.in"
                        className="flex items-center rounded-md border border-gray-300 px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        <FiMail className="mr-2 text-primary" />
                        <span>Email us at info@shehjar.co.in</span>
                      </a>
                      <Link
                        to="/contact"
                        className="flex items-center rounded-md border border-gray-300 px-4 py-3 text-sm hover:bg-gray-50"
                      >
                        <FiExternalLink className="mr-2 text-primary" />
                        <span>Contact us through our form</span>
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong>Note:</strong> Cancellation is only possible
                      within 12 hours of placing the order and only if the order
                      hasn't been shipped yet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Return/Exchange Information */}
              <div>
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0">
                    <FiRefreshCw className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-medium">
                      Returns & Exchanges
                    </h3>
                    <p className="mb-3 text-sm text-gray-600">
                      Shehjar offers returns and exchanges on most items within
                      3 days of delivery. For detailed information about our
                      policy, processing times, and eligibility criteria:
                    </p>
                    <Link
                      to="/refund-policy"
                      className="mb-4 inline-flex items-center rounded-md border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      View Our Return/Refund Policy{" "}
                      <FiExternalLink className="ml-2" />
                    </Link>
                    <p className="text-xs text-gray-500">
                      <strong>Note:</strong> Please contact us at
                      info@shehjar.co.in with your order details if you'd like
                      to initiate a return or exchange. Handcrafted items may
                      have specific return conditions, so please check our
                      policy for details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary - Right Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* Delivery Address */}
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="font-semibold">Delivery Address</h2>
              </div>
              <div className="p-6">
                <p className="font-medium">{order.deliveryAddress.fullName}</p>
                <p className="text-gray-600">{order.deliveryAddress.street}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress.city},{" "}
                  {order.deliveryAddress.stateName ||
                    order.deliveryAddress.state}{" "}
                  {order.deliveryAddress.zipCode}
                </p>
                <p className="text-gray-600">
                  {order.deliveryAddress.countryName ||
                    order.deliveryAddress.country}
                </p>
                <p className="mt-1 text-gray-600">
                  Phone: {order.deliveryAddress.phone}
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="font-semibold">Price Details</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>
                      {order.isFreeDelivery ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${order.deliveryCost.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="font-semibold">Need Help?</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col space-y-3">
                  <a
                    href="mailto:info@shehjar.co.in"
                    className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FiMail className="mr-2 text-primary" />
                    Email Customer Service
                  </a>
                  <Link
                    to="/contact"
                    className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FiExternalLink className="mr-2 text-primary" />
                    Contact Us Form
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to render status badge
const renderStatusBadge = (status) => {
  const statusClasses = {
    processing: "bg-yellow-50 text-yellow-700",
    shipped: "bg-blue-50 text-blue-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        statusClasses[status.toLowerCase()] || "bg-gray-50 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

export default OrderDetailsPage;
