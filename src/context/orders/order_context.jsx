// context/orders/orders_context.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../auth/auth_context";
import { toast } from "react-toastify";

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

export const OrdersProvider = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Automatically listen to user's order documents
  useEffect(() => {
    if (authLoading || !currentUser || !Array.isArray(currentUser.orders)) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const userOrderIds = currentUser.orders;
    if (userOrderIds.length === 0) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    let unsubscribes = [];

    // Firestore only allows "in" queries for up to 10 items
    const chunkedIds = [];
    for (let i = 0; i < userOrderIds.length; i += 10) {
      chunkedIds.push(userOrderIds.slice(i, i + 10));
    }

    const allOrders = [];

    setLoadingOrders(true);

    chunkedIds.forEach((chunk) => {
      const q = query(collection(db, "orders"), where("__name__", "in", chunk));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          allOrders.push(...fetchedOrders);

          // Merge and deduplicate by ID
          const mergedOrders = [
            ...new Map(allOrders.map((order) => [order.id, order])).values(),
          ];

          // Sort by createdAt desc
          mergedOrders.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return dateB - dateA;
          });

          setOrders(mergedOrders);
          setLoadingOrders(false);
        },
        (error) => {
          console.error("Error listening to orders:", error);
          toast.error("Failed to load your orders");
          setLoadingOrders(false);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser, authLoading]);

  const getOrderById = async (orderId) => {
    try {
      const existingOrder = orders.find((order) => order.id === orderId);
      if (existingOrder) return existingOrder;

      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        return { id: orderDoc.id, ...orderDoc.data() };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      toast.error("Failed to load order details");
      throw error;
    }
  };

  const loading = authLoading || loadingOrders;

  const value = useMemo(
    () => ({
      orders,
      loading,
      getOrderById,
    }),
    [orders, loading]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};
