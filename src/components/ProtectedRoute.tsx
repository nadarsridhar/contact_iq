import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { usePageRefresh } from "@/hooks";
import { hasPrivilege, LOGIN_MODE } from "@/utils/privileges";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  usePageRefresh();
  const { isAuthenticated } = useAuth();
  const isSAMLLoginEnabled = hasPrivilege(
    window.APP_CONFIG.L_MODE,
    LOGIN_MODE.SAML
  );
  const isTraditionalLoginEnabled = hasPrivilege(
    window.APP_CONFIG.L_MODE,
    LOGIN_MODE.TRADITIONAL_AUTH
  );

  if (!isAuthenticated)
    return <Navigate to={isSAMLLoginEnabled ? `/saml/login` : `/login`} />;

  return children;
};

export default ProtectedRoute;
