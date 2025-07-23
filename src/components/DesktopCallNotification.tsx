import { convertCallDurationSeconds } from "@/utils/dateHelpers";
import { useEffect, useRef, useState } from "react";
import { useSessionCall, useSIPProvider } from "./SipProvider";
import { CallSessionDirection, CallStatusState } from "@/utils/callStatus";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SessionState } from "sip.js";
import {
  MicIcon,
  MicOffIcon,
  PauseIcon,
  PhoneForwardedIcon,
  PhoneIcon,
  PhoneIncoming,
  PhoneOff,
  PhoneOffIcon,
  PhoneOutgoing,
  PlayIcon,
} from "lucide-react";
import AudioOutputSelector from "./AudioOutputSelector";
import globalState from "@/utils/globalState";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useTransferModal } from "@/hooks/useTransferModal";

const DesktopCallNotification = ({ sessionId, showNotification }) => {
  const countRef = useRef(null);
  const ringtoneRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const {
    session,
    answer,
    decline,
    direction,
    hangup,
    mute,
    unmute,
    isMuted,
    isHeld,
    unhold,
    hold,
  } = useSessionCall(sessionId);

  const { setIsActiveCall } = useSIPProvider();
  const { activeCall, currentCallData, agent } = useAuth();
  const { isPushNotificationAllowed } = usePrivilege();
  const { onOpen: openTransferModal } = useTransferModal();

  const isIncomingCall = direction === CallSessionDirection.INCOMING;
  const isOutgoingCall = direction === CallSessionDirection.OUTGOING;

  let callMsg = {};
  const webrtcClientName =
    session.incomingInviteRequest?.message?.headers["X-Cn"][0].raw;
  const webrtcClientId =
    session.incomingInviteRequest?.message?.headers["X-Ci"][0].raw;

  // Incoming call
  if (isIncomingCall) {
    callMsg = {};
    callMsg["state"] = "Initial";
    callMsg[
      "message"
    ] = `Incoming call from ${webrtcClientId} - ${webrtcClientName}`;
  } else if (isOutgoingCall) {
    // Outgoing call
    callMsg = {};
    const {
      ClientId,
      ClientName,
      IsBarginCall,
      ClientNumber = "",
      IsDialpadCall = false,
    } = activeCall;
    callMsg["state"] = "Initial";

    if (IsBarginCall) {
      callMsg["message"] = `Listening to ${ClientId} and ${agent.UserId}`;
    } else {
      if (
        IsDialpadCall ||
        ClientName === globalState.DIALPAD ||
        ClientId === globalState.DIALPAD
      ) {
        callMsg["message"] = `Calling ${ClientNumber}`;
      } else {
        callMsg["message"] = `Calling ${ClientId} ${
          ClientName ? ` - ${ClientName}` : ""
        }`;
      }
    }
  }

  // Call duration timer
  useEffect(() => {
    if (
      session.state === SessionState.Established &&
      currentCallData?.CallStatus === CallStatusState.ANSWERED
    ) {
      countRef.current = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    }

    return () => {
      clearInterval(countRef.current);
    };
  }, [session.state, currentCallData?.CallStatus]);

  useEffect(() => {
    if ("serviceWorker" in navigator && isPushNotificationAllowed) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "accept_call") {
          answer();
        }
        if (event.data.type === "reject_call") {
          decline();
        }
      });
    }
  }, [isPushNotificationAllowed]);

  // Play ringtone for incoming calls
  useEffect(() => {
    // Ringtone
    if (isIncomingCall) {
      if (session.state === "Initial") {
        if (ringtoneRef?.current) {
          ringtoneRef.current.autoPlay = true;
          ringtoneRef.current.play();
        }

        if (isPushNotificationAllowed) {
          showNotification({
            clientId: webrtcClientId,
            body: `Incoming call from ${webrtcClientId} - ${webrtcClientName}`,
          });
        }
      } else {
        if (ringtoneRef?.current) {
          ringtoneRef.current.autoPlay = true;
          ringtoneRef.current.pause();
        }
      }
    }

    if (
      session.state === SessionState.Initial ||
      session.state === SessionState.Establishing ||
      session.state === SessionState.Established
    ) {
      setIsActiveCall(true);
    } else {
      setIsActiveCall(false);
    }

    return () => {
      setIsActiveCall(false);
    };
  }, [isIncomingCall, session.state, isPushNotificationAllowed]);

  if (session.state === SessionState.Initial && isOutgoingCall) {
    callMsg.message = `Connecting call...`;
  }

  const handleTransfer = async () => {
    if (!window.APP_CONFIG.CALL_TRANSFER) return;
    openTransferModal();
  };

  return (
    <div
      className={`w-full right-0 px-4 font-semibold bg-yellow-100 border border-primary shadow text-gray-900 rounded-lg`}
    >
      <div className="flex justify-center items-center">
        <div className={"flex justify-center items-center space-x-2"}>
          <div className="relative flex items-center h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </div>
          <div className="flex items-center">
            {convertCallDurationSeconds(timer)}&nbsp;
            <div className="mx-2">
              {isIncomingCall && <PhoneIncoming className={`h-4 w-4`} />}
              {isOutgoingCall && <PhoneOutgoing className={`h-4 w-4`} />}
            </div>
            &nbsp;
            <div>{callMsg.message}</div>
          </div>

          <div className="flex justify-end items-center gap-3 p-4">
            {isIncomingCall && session.state === SessionState.Initial && (
              <>
                <Button
                  className="bg-green-500 hover:bg-green-500"
                  onClick={() => {
                    answer();
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneIcon size={15} />
                  <span className="ml-2">Answer</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    decline();
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneOffIcon size={15} />
                  <span className="ml-2">Reject</span>
                </Button>
              </>
            )}

            {SessionState.Established === session.state && (
              <>
                <AudioOutputSelector />

                <Button
                  className="bg-gray-800 hover:bg-gray-700"
                  onClick={() => {
                    isMuted ? unmute() : mute();
                    ringtoneRef.current.pause();
                  }}
                >
                  {!isMuted ? <MicIcon size={15} /> : <MicOffIcon size={15} />}
                </Button>

                <Button
                  className="bg-gray-800 hover:bg-gray-700"
                  onClick={() => {
                    isHeld ? unhold() : hold();
                    ringtoneRef.current.pause();
                  }}
                >
                  {isHeld ? <PlayIcon size={16} /> : <PauseIcon size={15} />}
                </Button>
              </>
            )}

            {SessionState.Established === session.state &&
              window.APP_CONFIG.CALL_TRANSFER && (
                <Button
                  className="bg-gray-800 hover:bg-gray-700"
                  onClick={handleTransfer}
                >
                  <PhoneForwardedIcon size={15} />
                </Button>
              )}

            {![SessionState.Terminating, SessionState.Terminated].includes(
              session.state
            ) &&
              isOutgoingCall && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    hangup();
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneOff size={15} />
                </Button>
              )}

            {isIncomingCall &&
              (session.state === SessionState.Establishing ||
                session.state === SessionState.Established) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    hangup();
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneOff size={15} />
                </Button>
              )}
          </div>

          <audio
            ref={ringtoneRef}
            src="/sounds/ringtone.wav"
            preload="auto"
            loop
          />
        </div>
      </div>
    </div>
  );
};

export default DesktopCallNotification;
