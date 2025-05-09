import { Navbar, Footer } from "./components";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ReactGA from "react-ga4";
import {
  Cart,
  Home,
  Checkout,
  Completion,
  NotFound,
  Features,
  News,
  Products,
  Services,
  SingleProduct,
  Login,
  Profile,
  ArtisansPage,
  SingleArtisanPage,
  SalePage,
  Orders,
  OrderDetails,
  About,
  Contact,
  TermsAndConditions,
  PrivacyPolicy,
  ShippingPolicy,
  RefundPolicy,
} from "./pages";
import { measurementID } from "./utils/constants";
import { useAuth } from "./context/auth/auth_context";
import ProtectedRoute from "./components/ProtectedRoute";

ReactGA.initialize(measurementID);

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";
  const { currentUser } = useAuth();

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/shop" element={<Products />} />
        <Route path="/shop/:id" element={<SingleProduct />} />
        <Route path="/artisans" element={<ArtisansPage />} />
        <Route path="/artisan/:id" element={<SingleArtisanPage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/order-success/:orderId" element={<Completion />} />
        <Route path="/features" element={<Features />} />
        <Route path="/services" element={<Services />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideLayout && <Footer />}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
