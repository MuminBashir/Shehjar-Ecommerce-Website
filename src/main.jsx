import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/cart/cart_context";
import { FiltersProvider } from "./context/filter/filter_context";
import { ProductsProvider } from "./context/product/products_context";
import { AuthProvider } from "./context/auth/auth_context";
import "./index.css";
import { SaleProvider } from "./context/sale/sale_context";
import { CheckoutProvider } from "./context/checkout/checkout_context";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ProductsProvider>
          <SaleProvider>
            <CheckoutProvider>
              <FiltersProvider>
                <App />
              </FiltersProvider>
            </CheckoutProvider>
          </SaleProvider>
        </ProductsProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
