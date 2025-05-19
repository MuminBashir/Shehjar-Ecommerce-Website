import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { FiCheckCircle, FiBox, FiTruck, FiHome } from "react-icons/fi";

const Completion = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setLoading(false);
          return;
        }

        // Query orders collection to find order by orderId
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("orderId", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto mt-20 flex max-w-screen-xl justify-center px-4 py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto mt-20 max-w-screen-xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
        <p className="mb-8">We couldn't find the order you're looking for.</p>
        <Link
          to="/"
          className="hover:bg-primary-dark inline-block rounded bg-primary px-6 py-3 text-white transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-20 max-w-screen-xl px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Order Successful!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
        </div>

        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
          <div className="bg-gray-50 px-6 py-4">
            <h2 className="font-semibold">Order #{order.orderId}</h2>
          </div>
          <div className="p-6">
            <div className="mb-4 flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className="font-medium text-green-600">
                {order.payment.status}
              </span>
            </div>
            <div className="mb-4 flex justify-between">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-medium">{order.payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">₹{order.total}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-4 font-semibold">Delivery Address</h2>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="font-medium">{order.deliveryAddress.fullName}</p>
            <p className="text-gray-600">{order.deliveryAddress.street}</p>
            <p className="text-gray-600">
              {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.stateName || order.deliveryAddress.state}{" "}
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

        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Order Items</h2>
          <div className="divide-y rounded-lg border border-gray-200">
            {order.items.map((item, index) => (
              <div key={index} className="flex p-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="ml-4 flex flex-1 flex-col">
                  <div className="flex justify-between text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-gray-500">
                        {item.color} | {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-right font-medium text-gray-900">
                      ₹
                      {item.isOnSale
                        ? item.discountedPrice * item.quantity
                        : item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Order Status</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

            <div className="relative mb-6 pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FiCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Order Placed</h3>
                <p className="text-sm text-gray-500">
                  Your order has been placed successfully
                </p>
              </div>
            </div>

            <div className="relative mb-6 pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <FiBox className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Processing</h3>
                <p className="text-sm text-gray-500">
                  Your order is being processed
                </p>
              </div>
            </div>

            <div className="relative mb-6 pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <FiTruck className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Shipped</h3>
                <p className="text-sm text-gray-500">
                  Your order is on the way
                </p>
              </div>
            </div>

            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <FiHome className="text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Delivered</h3>
                <p className="text-sm text-gray-500">
                  Your order has been delivered
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="hover:bg-primary-dark mr-4 rounded bg-primary px-6 py-3 text-white transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="rounded border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Completion;
