import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { collection, query, where, doc, getDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../auth/auth_context";
import { toast } from "react-toastify";

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  // Track fetched order IDs to prevent duplicate fetching
  const [fetchedOrderIds, setFetchedOrderIds] = useState(new Set());

  // Use useCollection to get real-time updates on user's orders
  const [ordersSnapshot, ordersLoading, ordersError] = useCollection(
    currentUser && currentUser.orders && currentUser.orders.length > 0
      ? query(
          collection(db, "orders"),
          where("__name__", "in", currentUser.orders.slice(0, 10)) // Firestore limits "in" queries to 10 items
        )
      : null
  );

  // Fetch order details for all user orders
  useEffect(() => {
    // Only proceed if auth is loaded and we have a current user with orders
    if (authLoading || !currentUser) {
      return;
    }

    // If user has no orders, set loading to false and return
    if (!currentUser.orders || currentUser.orders.length === 0) {
      setLoadingOrders(false);
      return;
    }

    // Handle case where user has more than 10 orders (Firestore "in" query limit)
    const fetchAllOrders = async () => {
      try {
        setOrderDetailsLoading(true);
        const userOrderIds = currentUser.orders || [];

        // Skip if we've already fetched all orders
        if (userOrderIds.every((id) => fetchedOrderIds.has(id))) {
          setOrderDetailsLoading(false);
          return;
        }

        let allOrders = [];

        // First batch comes from the real-time query
        if (ordersSnapshot && !ordersLoading) {
          const snapshotOrders = ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          allOrders = [...snapshotOrders];

          // Update fetched IDs
          const newFetchedIds = new Set(fetchedOrderIds);
          snapshotOrders.forEach((order) => newFetchedIds.add(order.id));
          setFetchedOrderIds(newFetchedIds);
        }

        // For remaining orders (if more than 10), fetch individually
        const remainingOrderIds = userOrderIds.filter(
          (id) =>
            !fetchedOrderIds.has(id) &&
            !allOrders.some((order) => order.id === id)
        );

        if (remainingOrderIds.length > 0) {
          const fetchPromises = remainingOrderIds.map((orderId) =>
            getDoc(doc(db, "orders", orderId))
              .then((docSnap) => {
                if (docSnap.exists()) {
                  return { id: docSnap.id, ...docSnap.data() };
                }
                return null;
              })
              .catch((err) => {
                console.error(`Error fetching order ${orderId}:`, err);
                return null;
              })
          );

          const additionalOrders = await Promise.all(fetchPromises);
          const validAdditionalOrders = additionalOrders.filter(
            (order) => order !== null
          );

          // Update orders state with all valid orders
          allOrders = [...allOrders, ...validAdditionalOrders];

          // Update fetched IDs with newly fetched orders
          const updatedFetchedIds = new Set(fetchedOrderIds);
          validAdditionalOrders.forEach((order) =>
            updatedFetchedIds.add(order.id)
          );
          setFetchedOrderIds(updatedFetchedIds);
        }

        // Sort orders by createdAt timestamp (most recent first)
        allOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        });

        setOrders(allOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your orders");
      } finally {
        setOrderDetailsLoading(false);
        setLoadingOrders(false);
      }
    };

    fetchAllOrders();
  }, [
    currentUser,
    authLoading,
    ordersSnapshot,
    ordersLoading,
    fetchedOrderIds,
  ]);

  // Handle errors from useCollection hook
  useEffect(() => {
    if (ordersError) {
      console.error("Error fetching orders collection:", ordersError);
      toast.error("Error loading your orders");
      setLoadingOrders(false);
    }
  }, [ordersError]);

  // Function to get a specific order by ID
  const getOrderById = async (orderId) => {
    try {
      // Check if order is already in state
      const existingOrder = orders.find((order) => order.id === orderId);
      if (existingOrder) {
        return existingOrder;
      }

      // If not, fetch it from Firestore
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        const orderData = { id: orderDoc.id, ...orderDoc.data() };
        return orderData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      toast.error("Failed to load order details");
      throw error;
    }
  };

  // Refresh orders (useful for when a new order is placed)
  const refreshOrders = () => {
    // Reset fetched IDs to force a refresh of all orders
    setFetchedOrderIds(new Set());
    setLoadingOrders(true);
  };

  // Combined loading state
  const loading = authLoading || loadingOrders || orderDetailsLoading;

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      orders,
      loading,
      refreshOrders,
      getOrderById,
    }),
    [orders, loading]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
