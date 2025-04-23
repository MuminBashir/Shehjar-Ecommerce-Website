import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/cart/cart_context";
import { FiltersProvider } from "./context/filter/filter_context";
import { ProductsProvider } from "./context/product/products_context";
import { AuthProvider } from "./context/auth/auth_context";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ProductsProvider>
          <FiltersProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </FiltersProvider>
        </ProductsProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
