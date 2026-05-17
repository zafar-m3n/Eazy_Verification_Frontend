import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import utilities from "@/lib/utilities";
import logo from "@/assets/logo.png";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const admin = utilities.getAdminData();

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "solar:chart-square-bold",
    },
    {
      label: "Verifications",
      path: "/admin/verifications",
      icon: "solar:document-text-bold",
    },
  ];

  function handleLogout() {
    utilities.logout();
    navigate("/admin/login", { replace: true });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function getPageTitle() {
    if (location.pathname.includes("/admin/verifications/")) {
      return "Verification Details";
    }

    if (location.pathname.includes("/admin/verifications")) {
      return "Verifications";
    }

    return "Dashboard";
  }

  function getNavClass({ isActive }) {
    return [
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
      isActive ? "bg-accent-1 text-card" : "text-text/70 hover:bg-background hover:text-text",
    ].join(" ");
  }

  return (
    <div className="min-h-screen bg-background text-text font-figtree">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-text/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <NavLink to="/admin/dashboard" onClick={closeSidebar} className="flex items-center">
            <img src={logo} alt="Eazy Verification" className="h-11 w-auto object-contain" />
          </NavLink>

          <button
            type="button"
            onClick={closeSidebar}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-text transition hover:border-accent-1 hover:bg-background lg:hidden"
            aria-label="Close menu"
          >
            <Icon icon="mdi:close" className="size-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text/50">Admin CRM</p>
          <h2 className="mt-2 text-lg font-bold text-text">Verification System</h2>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={closeSidebar} className={getNavClass}>
              <Icon icon={item.icon} className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-4 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-1 text-card">
                <Icon icon="solar:user-bold" className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text">{admin?.name || "Admin"}</p>
                <p className="truncate text-xs text-text/60">{admin?.email || "Administrator"}</p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            icon="solar:logout-3-bold"
            onClick={handleLogout}
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-text transition hover:border-accent-1 hover:bg-background lg:hidden"
                aria-label="Open menu"
              >
                <Icon icon="solar:hamburger-menu-bold" className="size-5" />
              </button>

              <div>
                <p className="text-sm font-bold text-text">{getPageTitle()}</p>
                <p className="hidden text-xs text-text/60 sm:block">Manage customer verification submissions</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-text/70 md:flex">
              <Icon icon="solar:shield-check-bold" className="size-4 text-accent-2" />
              Secure admin area
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
