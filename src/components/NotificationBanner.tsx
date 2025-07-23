import { usePrivilege } from "@/contexts/PrivilegeContext";
import { Button } from "./ui/button";
import {
  MicIcon,
  MicOffIcon,
  PhoneForwardedIcon,
  PhoneIcon,
  PhoneOff,
  PhoneOffIcon,
  PlayIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  CallSessionDirection,
  CallStatusState,
  convertCallDurationSeconds,
} from "@/utils";
import { CallType } from "@/utils/callStatus";
import { hangupCallApi, muteAudioApi } from "@/services/apiCalls";
import { toast } from "sonner";
import { useTransferModal } from "@/hooks/useTransferModal";
import conferenceCall from "../../public/SVGs/conferenceCall.svg";
import { useConferenceModal } from "@/hooks/useConferenceModal";

const NotificationBanner = () => {
  const countRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const { currentCallData } = useAuth();
  const { onOpen: openConferenceModal } = useConferenceModal();

  const isCallIncoming =
    (currentCallData?.CallStatus === CallStatusState.INCOMING ||
      currentCallData?.CallStatus === CallStatusState.ANSWERED) &&
    currentCallData?.CallType === CallType.INCOMING;
  const isCallOutgoing = currentCallData?.CallType === CallType.OUTGOING;
  const isCallAnswered =
    currentCallData?.CallType === CallType.INCOMING &&
    currentCallData?.CallStatus === CallStatusState.ANSWERED;
  const { onOpen: openTransferModal } = useTransferModal();

  const handleHangup = async () => {
    try {
      if (!currentCallData?.DealerChannel) {
        throw new Error("Cannot hang up - something went wrong");
      }
      const response = await hangupCallApi({
        AgentChannel: currentCallData?.DealerChannel,
      });
      if (response && response.status !== "success") {
        console.log("response", JSON.parse(response.response.data).error);
        throw new Error(
          `${JSON.parse(response.response.data).error || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to hang up call");
      throw error;
    }
  };

  const handleMuteAudio = async () => {
    try {
      if (!currentCallData?.DealerChannel) {
        throw new Error("Something went wrong!");
      }
      const response = await muteAudioApi({
        AgentChannel: currentCallData?.DealerChannel,
        muteState: !isMuted,
      });
      setIsMuted(!isMuted);

      if (response && response.status !== "success") {
        throw new Error(
          `${JSON.parse(response.response.data).error || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to hang up call");
    }
  };

  // Call duration timer
  useEffect(() => {
    if (
      currentCallData?.CallStatus === CallStatusState.ANSWERED &&
      currentCallData?.CallStatus !== CallStatusState.HANGUP
    ) {
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    }

    return () => {
      clearInterval(countRef.current);
    };
  }, [currentCallData?.CallStatus]);

  const handleTransfer = async () => {
    if (!window.APP_CONFIG.CALL_TRANSFER) return;
    openTransferModal();
  };

  const handleConferenceCall = async () => {
    openConferenceModal();
  };

  return (
    <div className="w-full right-0 px-4 py-5 md:py-0 font-semibold bg-yellow-100 border border-primary shadow text-gray-900 rounded-lg flex items-center">
      <div className="flex justify-center items-center">
        <div className="flex flex-col md:flex-row gap-4 md:gap-0  justify-center items-center space-x-2">
          <div className="flex flex-col-reverse gap-4 md:gap-0 h-[55px] md:flex-row items-center">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </div>
              {convertCallDurationSeconds(timer)}&nbsp;
            </div>
            <div className="flex items-center">
              <div className="mx-2">
                <PhoneIcon className="h-4 w-4" />
              </div>
              <div>
                {isCallIncoming ? (
                  <span className="flex items-center">
                    {currentCallData.CallStatus === CallStatusState.INCOMING ? (
                      <>
                        <span className="text-red-600 bg-red-50 px-2 rounded-md mr-2">
                          Incoming call
                        </span>{" "}
                        from{" "}
                        <span className="font-bold mx-1">
                          {currentCallData.ClientId}
                        </span>{" "}
                        -
                        <span className="font-medium ml-1">
                          {currentCallData.ClientName}
                        </span>
                      </>
                    ) : currentCallData.CallStatus ===
                      CallStatusState.ANSWERED ? (
                      <>
                        <span className="text-green-600 mr-2 bg-green-50 px-2 rounded-md">
                          Connected with
                        </span>{" "}
                        <span className="font-bold mx-1">
                          {currentCallData.ClientId}
                        </span>{" "}
                        -
                        <span className="font-medium ml-1">
                          {currentCallData.ClientName}
                        </span>
                      </>
                    ) : (
                      <>Call ended</>
                    )}
                  </span>
                ) : isCallOutgoing ? (
                  <span className="flex items-center">
                    {currentCallData.CallStatus === CallStatusState.ANSWERED ? (
                      <>
                        <span className="text-green-600 mr-2 bg-green-50 px-2 rounded-md">
                          Connected with
                        </span>{" "}
                        <span className=" mx-1">
                          {currentCallData.ClientId}
                        </span>{" "}
                        -
                        <span className=" ml-1">
                          {currentCallData.ClientName}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-blue-600 mr-1 bg-blue-50 px-2 rounded-md">
                          Dialing{" "}
                        </span>{" "}
                        <span className=" mx-1">
                          {currentCallData.ClientId}
                        </span>{" "}
                        -
                        <span className=" ml-1">
                          {currentCallData.ClientName}
                        </span>
                      </>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-500">No active call</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 md:p-4">
            {(!isCallIncoming || isCallAnswered) && (
              <>
                <Button
                  className={`bg-gray-800 hover:bg-gray-700`}
                  onClick={handleMuteAudio}
                >
                  {!isMuted ? <MicIcon size={15} /> : <MicOffIcon size={15} />}
                </Button>

                <Button
                  className="bg-gray-800 hover:bg-gray-700"
                  onClick={handleTransfer}
                >
                  <PhoneForwardedIcon size={15} />
                </Button>

                <Button variant="destructive" onClick={handleHangup}>
                  <PhoneOff size={15} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
