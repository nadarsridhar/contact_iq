import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, SIPProvider, ProfileProvider } from "@/contexts";
import Login from "@/pages/login/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

import AdminDashboard from "@/pages/admin/dashboard";
import UserMaster from "@/pages/admin/users";
import ClientMaster from "@/pages/admin/clients";
import TemplateMapping from "./pages/admin/template-mapping";
import BranchMaster from "@/pages/admin/branch";
import Footer from "./components/Footer";
import CallTrafficReport from "./pages/admin/reports/call-traffic-report";
import Privilege from "./pages/privilege";
import { PrivilegeProvider } from "./contexts/PrivilegeContext";
import SAMLLogin from "./pages/login/SAMLLogin";
import NotFound from "./pages/NotFound";
import UserActivityReport from "./pages/admin/reports/user-activity-report";
import CallTasks from "./pages/call-queue";
import { hasPrivilege, LOGIN_MODE } from "./utils/privileges";
import TradeExceptionReport from "./pages/admin/reports/trade-exception";
import GlobalSettings from "./components/GlobalSettings";
import { useEffect } from "react";
import Followups from "./pages/admin/followups";
import ApiKeyGenerator from "./components/api-keys/ApiKeyGenerator";
import useActiveTab from "./hooks/useActiveTab";
import ApplicationOpenPage from "./components/ApplicationOpenPage";

function App() {
  const SIP_URL = window.APP_CONFIG.SIP_HOST;
  const SIP_WS_PATH = window.APP_CONFIG.SIP_WS;
  // const { isActiveTab } = useActiveTab();

  const sipProviderConfig = {
    domain: SIP_URL,
    webSocketServer: SIP_WS_PATH,
  };

  const AUTH_MODE = window.APP_CONFIG.L_MODE;
  const isSAMLLoginEnabled = hasPrivilege(AUTH_MODE, LOGIN_MODE.SAML);

  // if (!isActiveTab) {
  //   return <ApplicationOpenPage />;
  // }

  return (
    <Router>
      <div className="font-sans">
        <AuthProvider>
          <PrivilegeProvider>
            <ProfileProvider>
              <SIPProvider options={sipProviderConfig}>
                <Routes>
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route path="/admin/branch" element={<BranchMaster />} />
                    <Route path="/users" element={<UserMaster />} />
                    <Route path="/clients" element={<ClientMaster />} />
                    <Route path="/privileges" element={<Privilege />} />
                    <Route path="/call-tasks" element={<CallTasks />} />
                    <Route path="/followups" element={<Followups />} />
                    <Route path="/api-keys" element={<ApiKeyGenerator />} />
                    <Route
                      path="/admin/template-mapping"
                      element={<TemplateMapping />}
                    />
                    <Route
                      path="/admin/reports"
                      element={<CallTrafficReport />}
                    />
                    <Route
                      path="/admin/reports/call-traffic"
                      element={<CallTrafficReport />}
                    />
                    <Route
                      path="/admin/reports/user-activity"
                      element={<UserActivityReport />}
                    />
                    <Route
                      path="/admin/reports/trade-exception"
                      element={<TradeExceptionReport />}
                    />
                    <Route
                      path="/admin/settings"
                      element={<GlobalSettings />}
                    />
                  </Route>
                  <Route
                    path="/"
                    element={isSAMLLoginEnabled ? <SAMLLogin /> : <Login />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/saml/login" element={<SAMLLogin />} />
                  {/* <Route path="/not-allowed" element={<NotAllowed />} /> */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster richColors position="top-center" duration={2000} />
              </SIPProvider>
            </ProfileProvider>
          </PrivilegeProvider>
        </AuthProvider>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
