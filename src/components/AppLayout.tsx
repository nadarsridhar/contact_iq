import logo from "/logo.svg";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import AppOutlet from "./AppOutlet";
import { VTS_SOCKET_LOGOUT_CHANNEL } from "@/utils";
import { ProfileDetailsModal } from "./ProfileDetailsModal";
import ChangePasswordModal from "./ChangePassword";
import ValidatePassword from "./ValidatePassword";
import { useSIPProvider } from "./SipProvider";
import { useProfileContext } from "@/contexts/ProfileContext";
import DialPad from "./Dialpad";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useAxiosWithAuth } from "@/utils/apiClient";
import TransferModal from "./TransferModal";
import { hasPrivilege, LOGIN_MODE } from "@/utils/privileges";
import ConferenceModal from "./ConferenceModal";
import {
  VTS_SOCKET_FOLLOW_UP_CHANNEL,
  VTS_SOCKET_TRADE_EXCEPTION_CHANNEL,
} from "@/utils/constants";
import { eTEGeneratorStatus } from "@/pages/admin/reports/trade-exception";
import {
  CreateFollowupDialog,
  FollowUpModalRenderer,
} from "./followups/FollowupDialog";
import { useFollowUpModalStore } from "@/hooks/useCreateFollowup";
import { TaskStatus } from "@/utils/followup";
import { useIsMobile } from "@/hooks/use-mobile";
import ApiKeysModal from "@/components/api-keys/ApiKeysModal";

function AppLayout() {
  const { logout, socket, isWebSocketConnected, agent, isSuperAdmin } =
    useAuth();
  const { sessionManager } = useSIPProvider();
  const { refAudioRemote } = useProfileContext();
  const { isDialpadAllowed, isPushNotificationAllowed, isFollowupTaskAllowed } =
    usePrivilege();
  const navigate = useNavigate();

  useAxiosWithAuth();
  const isMobile = useIsMobile();
  const openFollowupModal = useFollowUpModalStore((state) => state.openModal);

  useEffect(() => {
    socket?.on(VTS_SOCKET_LOGOUT_CHANNEL, async () => {
      // Disconnect and unregister WebRTC
      await sessionManager?.unregister();
      await sessionManager?.disconnect();

      // Server logout
      await logout();
      if (refAudioRemote?.current) refAudioRemote.current.stop();

      const isSAMLLoginEnabled = hasPrivilege(
        window.APP_CONFIG.L_MODE,
        LOGIN_MODE.SAML
      );
      navigate(isSAMLLoginEnabled ? "/saml/login" : "/login");
    });

    return () => {
      socket?.off(VTS_SOCKET_LOGOUT_CHANNEL);
    };
  }, [socket, isWebSocketConnected]);

  // Listen for online user records socket events
  useEffect(() => {
    if (!isWebSocketConnected) return;

    socket?.on(VTS_SOCKET_TRADE_EXCEPTION_CHANNEL, async (data) => {
      console.log("Global trade exception data received", data.message);
      window.dispatchEvent(
        new CustomEvent("fetch-trade-report", { detail: data.message })
      );
      toast.dismiss();

      if (data.message.TEGeneratorStatus === eTEGeneratorStatus.Completed) {
        toast.success("Success!", {
          description: `Trade report for ${format(
            new Date(Number(data.message.Date) * 1000),
            "dd-MM-yyyy"
          )} is generated`,
          icon: <CheckCircle className="h-4 w-4" />,
          className: "w-400",
          duration: 5000,
          closeButton: true,
          action: {
            label: "View Report",
            onClick: (t) => {
              toast.dismiss(t);
              // TODO: Add report type query paramter too to render report according to report type query parameter
              navigate(
                `/admin/reports/trade-exception?date=${data.message.Date}`
              );
            },
          },
        });
      } else if (data.message.TEGeneratorStatus === eTEGeneratorStatus.Failed) {
        toast.error(
          `Trade report was not generated for ${format(
            new Date(Number(data.message.Date) * 1000),
            "dd-MM-yyyy"
          )} is failed due to ${data.message.Reason}`
        );
      }
    });

    return () => {
      socket?.off(VTS_SOCKET_TRADE_EXCEPTION_CHANNEL);
    };
  }, [isWebSocketConnected, agent?.UserId]);

  useEffect(() => {
    if (!isWebSocketConnected || !isFollowupTaskAllowed) return;

    socket?.on(VTS_SOCKET_FOLLOW_UP_CHANNEL, async (data) => {
      console.log("Follow up socket data received: ", data.message);

      const { CallInfo: callInfo = {}, TaskInfo: taskInfo = {} } = data.message;
      if (taskInfo?.TaskStatus !== TaskStatus.FollowUp) return;
      openFollowupModal(taskInfo?.UUID, data.message);

      // Trigger push notification for the follow up
      if (!isMobile && isPushNotificationAllowed) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(
            `Follow up scheduled for ${taskInfo?.ClientId}`,
            {
              body: taskInfo.Title,
              icon: logo,
              actions: [],
            }
          );
        });
      }
    });

    return () => {
      socket?.off(VTS_SOCKET_FOLLOW_UP_CHANNEL);
    };
  }, [
    isWebSocketConnected,
    isFollowupTaskAllowed,
    isPushNotificationAllowed,
    isMobile,
  ]);

  return (
    <div className="bg-slate-200">
      <div className="flex gap-6 pb-8">
        <AppOutlet />
      </div>
      <ProfileDetailsModal />
      <ChangePasswordModal userId={agent.UserId} />
      <ValidatePassword />
      <TransferModal />
      <ConferenceModal />
      {isDialpadAllowed && (
        <div className="md:mt-4">
          <DialPad />
        </div>
      )}
      <CreateFollowupDialog />
      <FollowUpModalRenderer />
      {isSuperAdmin && <ApiKeysModal />}
    </div>
  );
}

export default AppLayout;
