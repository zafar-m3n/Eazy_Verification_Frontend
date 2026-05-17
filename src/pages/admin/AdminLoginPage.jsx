import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Notification from "@/components/ui/Notification";
import TextInput from "@/components/form/TextInput";

import API from "@/services";
import utilities from "@/lib/utilities";

import logo from "@/assets/logo.png";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
      general: "",
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await API.private.loginAdmin({
        email: formData.email.trim(),
        password: formData.password,
      });

      const responseData = utilities.getResponseData(response);
      const token = responseData?.token;
      const admin = responseData?.admin;

      if (!token) {
        throw new Error("Login token was not returned by the server.");
      }

      utilities.setAuthToken(token);

      if (admin) {
        utilities.setAdminData(admin);
      }

      utilities.scheduleAutoLogout();

      Notification.success("Logged in successfully.");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      const message = utilities.getApiErrorMessage(error, "Invalid email or password.");

      setErrors((currentErrors) => ({
        ...currentErrors,
        general: message,
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-background px-4 py-4 font-figtree text-text sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[1fr_0.85fr]">
          <div className="flex flex-col justify-center px-5 py-6 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-5 text-center lg:text-left">
                <img src={logo} alt="Eazy Verification" className="mx-auto h-10 w-auto object-contain lg:mx-0" />

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-text/50">Admin Login</p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">
                  Sign in to the verification dashboard.
                </h1>

                <p className="mt-2 text-sm leading-6 text-text/60">
                  Access customer submissions, review documents, and manage approval decisions securely.
                </p>
              </div>

              {errors.general && (
                <div className="mb-4 rounded-2xl border border-accent-2 bg-background px-4 py-3 text-sm font-medium text-text">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  error={errors.email}
                  disabled={loading}
                  autoComplete="email"
                />

                <TextInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={errors.password}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  icon={loading ? "svg-spinners:180-ring" : "solar:login-3-bold"}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs leading-5 text-text/50">
                This page is restricted to EazyMarkets admins.
              </p>
            </div>
          </div>

          <div className="hidden border-l border-border bg-background p-6 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-text/70">
                <Icon icon="solar:shield-check-bold" className="size-4 text-accent-2" />
                Secure review area
              </div>

              <h2 className="mt-6 max-w-sm text-2xl font-bold leading-tight text-text">
                Review customer verification submissions with confidence.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-text/60">
                View submitted details, check uploaded documents, update internal notes, and approve or reject
                verification requests.
              </p>
            </div>

            <div className="mt-10 grid gap-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:document-text-bold" className="size-5 text-accent-2" />
                  <p className="text-sm font-semibold text-text">Submission review</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:folder-with-files-bold" className="size-5 text-accent-2" />
                  <p className="text-sm font-semibold text-text">Document access</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:check-circle-bold" className="size-5 text-accent-2" />
                  <p className="text-sm font-semibold text-text">Approve or reject</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
