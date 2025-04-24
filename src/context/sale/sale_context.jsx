import { createContext, useContext } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "../../firebase/config";

// Create the context
const SalesContext = createContext();

// Create a custom hook for using the context
export const useSale = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};

// Create the provider component
export const SaleProvider = ({ children }) => {
  // Fetch the current sale document from Firestore
  const [currentSaleDoc, loading, error] = useDocument(
    doc(db, "sales", "current_sale")
  );

  // Process the sale data
  const currentSale = currentSaleDoc?.data();

  // Value to be provided by the context
  const value = {
    currentSale,
    isLoading: loading,
    error,
    hasActiveSale: currentSale && currentSale.status == "live",
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
};
