import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/orders/order_context";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
} from "react-icons/fi";
import Loading from "../../components/Loading";
import { Empty_order } from "../../components";

const Orders = () => {
  const { orders, loading } = useOrders();

  // Function to get status icon based on order status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <FiPackage className="text-yellow-500" />;
      case "shipped":
        return <FiTruck className="text-blue-500" />;
      case "delivered":
        return <FiCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  // Function to get status color based on order status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="container mx-auto mt-32 flex justify-center px-4 py-16 md:mt-28">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-32 max-w-screen-xl px-4 py-8 md:mt-28">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <Empty_order />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div>
                  <h2 className="font-medium">Order #{order.orderId}</h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="p-6">
                <div className="mb-4 flex flex-wrap items-start gap-6">
                  {/* Order summary */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Items
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="h-16 w-16 overflow-hidden rounded-md border border-gray-200"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Delivery Address
                    </h3>
                    <p className="text-sm">{order.deliveryAddress.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {order.deliveryAddress.street}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.stateName ||
                        order.deliveryAddress.state}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.deliveryAddress.countryName ||
                        order.deliveryAddress.country}
                      , {order.deliveryAddress.zipCode}
                    </p>
                  </div>

                  {/* Order total */}
                  <div className="w-full sm:w-auto">
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Total
                    </h3>
                    <p className="text-lg font-medium">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">{getStatusIcon(order.status)}</span>
                    {order.status === "shipped" ? (
                      <span>Your order is on the way</span>
                    ) : order.status === "delivered" ? (
                      <span>
                        Delivered on{" "}
                        {formatDate(order.deliveredAt || order.createdAt)}
                      </span>
                    ) : order.status === "cancelled" ? (
                      <span>Order was cancelled</span>
                    ) : (
                      <span>Your order is being processed</span>
                    )}
                  </div>

                  <Link
                    to={`/orders/${order.orderId}`}
                    className="hover:text-primary-dark flex items-center text-sm font-medium text-primary"
                  >
                    View Details
                    <FiChevronRight className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
