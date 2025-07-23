import { PhoneIcon, PlugZap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSIPProvider } from "./SipProvider";
import { CallStatusState, RegisterStatus } from "@/utils";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { makeCallApi } from "@/services/apiCalls";

function HandleCall({ call, className = "w-4 font-bold" }) {
  const { isBarginAllowed, isClickToCallAllowed, isAMICallAllowed } =
    usePrivilege();

  if (!isClickToCallAllowed && !isBarginAllowed && !isAMICallAllowed)
    return null;

  const { agent, setActiveCall } = useAuth();
  const { sessionManager, isActiveCall, registerStatus } = useSIPProvider();

  const handleCall = async (receiver = {}) => {
    if (isActiveCall) return;

    try {
      setActiveCall(receiver);
      const SIP_URL = window.APP_CONFIG.SIP_HOST;
      let { ClientId, ClientName, ClientNumber = "", IsDialpadCall } = receiver;

    const customHeaders = [
        `DI: ${agent.UserId}`,
        `DN: ${agent.UserMobileNumber}`,
        `CN: ${ClientNumber}`,
        `CI: ${ClientId}`,
        `CNM: ${ClientName}`,
        `IS_DIALPAD_CALL: ${IsDialpadCall}`,
      ];

      let sipUri = `sip:${agent.UserMobileNumber}@${SIP_URL}`;

      if (isBarginAllowed && call.CallStatus === CallStatusState.ANSWERED) {
        customHeaders.push(`UC: ${call.DealerChannel}`);
        sipUri = `sip:9999@${SIP_URL}`; // For bargin
      }

      const inviterOptions = { extraHeaders: customHeaders };
      await sessionManager?.call(sipUri, inviterOptions);

      if (window?.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler(
          "OutgoingCall",
          ClientId,
          ClientName
        );
      }
    } catch (error) {
      console.log(error.message);
      if (error.message === "Permission denied") {
        toast.error(`Kindly enable microphone permissions`);
        return;
      }
      console.error("Failed while initiating call", error);
    }
  };

  const handleAMICall = async (receiver = {}) => {
    let { ClientId, ClientName, ClientNumber = "", IsDialpadCall } = receiver;

    try {
      const payload = {
        AgentNumber: agent.UserMobileNumber,
        AgentId: agent.UserId,
        ClientName,
        ClientId,
        ClientNumber,
        IsDialpadCall,
      };
      const response = await makeCallApi(payload);
      if (response && response.status !== "success") {
        toast.error(JSON.parse(response.response.data).error);
        throw new Error(JSON.parse(response.response.data).error);
      }
      toast.success("Connecting call..");
    } catch (error) {
      console.error("Error while making AMI calls", error);
    }
  };

  const shouldBargin =
    isBarginAllowed && call.CallStatus == CallStatusState.ANSWERED;

  return (
    <>
      {shouldBargin ? (
        <Button
          onClick={() => handleCall(call)}
          className={`p-2 cursor-pointer`}
          variant="ghost"
          disabled={!call.DealerChannel}
        >
          <PlugZap className={className} />
        </Button>
      ) : (
        <Button
          disabled={isActiveCall}
          onClick={
            isAMICallAllowed || registerStatus === RegisterStatus.UNREGISTERED
              ? () => handleAMICall(call)
              : () => handleCall(call)
          }
          className={`px-2 py-0 ${
            isActiveCall ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          variant="ghost"
        >
          <PhoneIcon className={className} />
        </Button>
      )}
    </>
  );
}

export default HandleCall;
