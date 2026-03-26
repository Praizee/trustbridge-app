import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

import PageNotFound from "./pages/PageNotFound";
import Home from "./pages/Home";
import ExploreCampaigns from "./pages/ExploreCampaigns";
import CampaignDetails from "./pages/CampaignDetails";
import CreateCampaign from "./pages/CreateCampaign";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorCampaignDetails from "./pages/CreatorCampaignDetails";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import RequestHospitalVerification from "./pages/RequestHospitalVerification";
import HospitalDashboard from "./pages/HospitalDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentCallback from "./pages/PaymentCallback";

import Layout from "./Layout";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const AppRoutes = () => {
  const { isLoading, error } = useAuthStore();

  // Special full-screen error states (not login errors — those are handled in Login.jsx)
  if (!isLoading && error === "user_not_registered") {
    return <UserNotRegisteredError />;
  }
  if (!isLoading && error === "auth_required") {
    window.location.href = "/login";
    return null;
  }

  return (
    <>
      <ScrollToTop />
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="size-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : (
        <Routes>
          <Route element={<LayoutWrapper />}>
            {/* Journey 1: The Donor */}
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<ExploreCampaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route
              path="/request-hospital-verification"
              element={<RequestHospitalVerification />}
            />

            {/* Journey 2: The Creator */}
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route
              path="/creator/campaigns/:id"
              element={<CreatorCampaignDetails />}
            />

            {/* Journey 3: The Hospital */}
            <Route path="/admin" element={<HospitalDashboard />} />

            {/* TrustBridge Ops */}
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      )}
    </>
  );
};

function App() {
  return (
    <>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

