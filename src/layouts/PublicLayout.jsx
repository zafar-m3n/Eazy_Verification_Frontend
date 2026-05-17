import { Link, Outlet } from "react-router-dom";

import logo from "@/assets/logo.png";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-text font-figtree">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-5 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={logo} alt="Eazy Verification" className="h-11 w-auto object-contain" />
          </Link>

          <p className="text-sm font-medium text-text/60">Verification Portal</p>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-6 text-center text-sm text-text/55 sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
          <p>© {new Date().getFullYear()} Eazy Verification. All Rights Reserved.</p>

          <p>Secure customer verification powered by EazyMarkets.</p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
