import { Navigate } from "react-router-dom";
import utilities from "@/lib/utilities";

function PublicRoute({ children }) {
  if (utilities.isAuthenticated() && !utilities.isExpired()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
