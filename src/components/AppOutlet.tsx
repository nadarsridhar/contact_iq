import { useEffect, useState } from "react";
import logo from "/logo.svg";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import UserNav from "./UserNav";
import { useAuth } from "@/contexts/AuthContext";
import { CallStatusState, RegisterStatus } from "@/utils";
import { useSIPProvider } from "./SipProvider";
import { useCallManager, useIsMobile } from "@/hooks";
import DesktopCallNotification from "./DesktopCallNotification";
import MobileCallNotification from "./MobileCallNotification";
import { requestNotificationPermission } from "@/utils/pushNotification";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import NotificationBanner from "./NotificationBanner";
import LoginReminder from "./LoginReminder";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import CallQualityMonitor from "./CallQualityMonitor";

export default function AppOutlet() {
  const {
    agent,
    isWebSocketConnected,
    isTeamManager,
    isAgent,
    currentCallData,
  } = useAuth();
  const { isPushNotificationAllowed, isWebrtcAllowed } = usePrivilege();
  const { registerStatus, activeSession } = useSIPProvider();
  const { isLoginAlertOpen } = useAuth();

  const isOngoing =
    currentCallData?.CallStatus === CallStatusState.INCOMING ||
    currentCallData?.CallStatus === CallStatusState.ANSWERED;

  const isMobile = useIsMobile();
  useCallManager();

  // const activeSessionId1 = sessionManager?.managedSessions[0]?.session?.id;
  const activeSessionId = activeSession?._id;

  const [permission, setPermission] = useState(
    window?.Notification ? Notification?.permission : null
  );

  const showNotification = ({ clientId = "", body = "" }) => {
    if (isMobile || !isPushNotificationAllowed) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(`Incoming call from ${clientId}`, {
        body,
        icon: logo,
        actions: [
          { action: "handle_accept_call", title: "Accept" },
          { action: "handle_reject_call", title: "Reject" },
        ],
      });
    });
  };

  // Get permissions for push notifications
  useEffect(() => {
    if (
      permission === "default" &&
      !isMobile &&
      window?.Notification &&
      isPushNotificationAllowed
    ) {
      requestNotificationPermission().then((perm) => {
        setPermission(perm);
      });
    }
  }, [permission, isMobile, isPushNotificationAllowed]);

  const TOP_LEFT_CONTENT = window.APP_CONFIG.TOP_LEFT_CONTENT;
  const TOP_RIGHT_CONTENT = window.APP_CONFIG.TOP_RIGHT_CONTENT;

  const wssUrl = window.APP_CONFIG.SIP_WS;
  const httpsUrl = wssUrl.replace(/^wss:\/\//i, "https://");

  const showWebrtcMobileCallBanner =
    activeSessionId && isMobile && isWebrtcAllowed;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar className="bg-white" />
        <SidebarInset>
          <header className="flex shadow sticky top-0 bg-background z-50 h-16 shrink-0 justify-between items-center gap-2 border-b px-4 text-md">
            {!(isMobile && (isTeamManager || isAgent)) ? (
              <SidebarTrigger />
            ) : (
              <SidebarTrigger />
            )}

            <div className="justify-between w-full px-5 hidden md:flex">
              <div className="">{TOP_LEFT_CONTENT}</div>
              <div className="">{TOP_RIGHT_CONTENT}</div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center justify-center">
                <p className="mr-2 whitespace-nowrap text-xl md:text-md flex gap-1">
                  <span className="md:hidden">Hi, </span>
                  <span className="hidden md:block">Welcome, </span>
                  <span className="font-semibold">{agent?.UserId}</span>
                </p>

                <div className="space-y-1">
                  {isWebrtcAllowed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => {
                            window.open(httpsUrl);
                          }}
                          className={`rounded-full h-2 w-2 mr-2 cursor-pointer ${
                            registerStatus === RegisterStatus.REGISTERED
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-white text-gray-800 border border-gray-200 shadow-lg"
                      >
                        <p className="font-medium">
                          {registerStatus === RegisterStatus.REGISTERED
                            ? "Internet call Connected"
                            : "Internet call Disconnected"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {registerStatus === RegisterStatus.REGISTERED
                            ? "Internet call is active"
                            : "Click to check internet call connection"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`rounded-full h-2 w-2 mr-2 cursor-pointer ${
                          isWebSocketConnected ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-white text-gray-800 border border-gray-200 shadow-lg"
                    >
                      <p className="font-medium">
                        {isWebSocketConnected
                          ? "WebSocket Connected"
                          : "WebSocket Disconnected"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isWebSocketConnected
                          ? "Your WebSocket connection is active"
                          : "WebSocket connection is not available"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <UserNav />
            </div>
          </header>
          <div className="flex justify-center">
            {activeSessionId && !isMobile && isWebrtcAllowed && (
              <div className="flex justify-center bg-white max-w-[800px] bg-transparent shadow-md">
                <DesktopCallNotification
                  sessionId={activeSessionId}
                  showNotification={showNotification}
                />
              </div>
            )}

            {/* {activeSessionId && isWebrtcAllowed && (
              <CallQualityMonitor sessionId={activeSessionId} />
            )} */}

            {isOngoing && !isWebrtcAllowed && (
              <div className="flex justify-center bg-white max-w-[800px] bg-transparent shadow-md">
                <NotificationBanner />
              </div>
            )}

            {/* Mobile call notification */}
            {showWebrtcMobileCallBanner && (
              <div className="block sm:hidden shadow-md mt-2">
                <MobileCallNotification sessionId={activeSessionId} />
              </div>
            )}
          </div>

          <div className="md:pt-4 mx-auto px-2 md:px-0 w-full md:w-[95%] flex-1 mb-20 ">
            {isLoginAlertOpen && <LoginReminder />}
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
