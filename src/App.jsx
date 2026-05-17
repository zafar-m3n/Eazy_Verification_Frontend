import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";

import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

import utilities from "@/lib/utilities";

import VerificationLandingPage from "@/pages/public/VerificationLandingPage";
import VerificationFormPage from "@/pages/public/VerificationFormPage";
import VerificationSuccessPage from "@/pages/public/VerificationSuccessPage";

import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import VerificationListPage from "@/pages/admin/VerificationListPage";
import VerificationDetailsPage from "@/pages/admin/VerificationDetailsPage";

function AppRoutes() {
  useEffect(() => {
    utilities.initAuthSession(() => {
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    });
  }, []);

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<VerificationLandingPage />} />
          <Route path="/success" element={<VerificationSuccessPage />} />
        </Route>
        <Route path="/verification" element={<VerificationFormPage />} />

        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <AdminLoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="verifications" element={<VerificationListPage />} />
          <Route path="verifications/:id" element={<VerificationDetailsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
