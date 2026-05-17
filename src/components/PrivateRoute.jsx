import { Navigate } from "react-router-dom";
import utilities from "@/lib/utilities";

function PrivateRoute({ children }) {
  if (!utilities.isAuthenticated() || utilities.isExpired()) {
    utilities.logout();
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default PrivateRoute;
