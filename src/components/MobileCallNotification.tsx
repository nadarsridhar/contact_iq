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
import MobileAudioOutputSelector from "./MobileAudioOutputSelector";
import { checkIsIOSEnv } from "@/lib/utils";
import { useIsMobile } from "@/hooks";
import AudioOutputSelector from "./AudioOutputSelector";
import { useTransferModal } from "@/hooks/useTransferModal";
import { useProfileContext } from "@/contexts/ProfileContext";
import { toast } from "sonner";

const MobileCallNotification = ({ sessionId }) => {
  console.log("Mobile component");
  const countRef = useRef(0);
  const ringtoneRef = useRef(null);
  const isMobile = useIsMobile();
  const [timer, setTimer] = useState(0);
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
  const { activeCall, currentCallData } = useAuth();
  const { setIsActiveCall } = useSIPProvider();
  const { onOpen: openTransferModal } = useTransferModal();
  const { mobileSelectedDevice } = useProfileContext();

  const isIncomingCall = direction === CallSessionDirection.INCOMING;
  const isOutgoingCall = direction === CallSessionDirection.OUTGOING;

  let callMsg = {};
  // Incoming call
  if (direction === CallSessionDirection.INCOMING) {
    const webrtcClientName =
      session.incomingInviteRequest?.message?.headers["X-Cn"][0].raw;
    const webrtcClientNumber =
      session.incomingInviteRequest?.message?.headers["X-Cm"][0].raw;
    const webrtcCallStatus =
      session.incomingInviteRequest?.message?.headers["X-Cs"][0].raw;
    const webrtcClientId =
      session.incomingInviteRequest?.message?.headers["X-Ci"][0].raw;
    const webrtcSessionId =
      session.incomingInviteRequest?.message?.headers["X-Si"][0].raw;

    callMsg["state"] = "Initial";
    callMsg[
      "message"
    ] = `Incoming call from ${webrtcClientId} - ${webrtcClientName}`;
  } else if (isOutgoingCall) {
    // Outgoing call
    const { ClientId, ClientName } = activeCall;
    callMsg["state"] = "Initial";
    callMsg["message"] = `Outgoing call to ${ClientId} ${
      ClientName ? ` - ${ClientName}` : ""
    }`;
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

  // Play ringtone for incoming calls
  useEffect(() => {
    if (isIncomingCall && window?.flutter_inappwebview) {
      if (session.state === "Initial") {
        window.flutter_inappwebview.callHandler("PlayRingtone");
      } else {
        window.flutter_inappwebview.callHandler("StopRingtone");
      }
    }

    if (
      session.state === SessionState.Initial ||
      session.state === SessionState.Establishing ||
      session.state === SessionState.Established
    ) {
      setIsActiveCall(true);
    } else {
      if (window?.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler(
          "HangupCall",
          isIncomingCall ? "Incoming" : "Outgoing"
        );
      }
      setIsActiveCall(false);
    }

    return () => {
      setIsActiveCall(false);
    };
  }, [isIncomingCall, session.state]);

  if (session.state === SessionState.Initial && isOutgoingCall) {
    callMsg.message = `Connecting call...`;
  }

  const handleTransfer = async () => {
    if (!window.APP_CONFIG.CALL_TRANSFER) return;
    openTransferModal();
  };

  useEffect(() => {
    return () => {
      if (window?.flutter_inappwebview) {
        window.flutter_inappwebview.callHandler("StopRingtone");
      }
    };
  }, []);

  function switchMobileOutput() {
    // setTimeout(() => {
    toast.success(`Switching to ${mobileSelectedDevice}`);
    switch (mobileSelectedDevice) {
      case "Speaker":
        window.flutter_inappwebview.callHandler("SpeakerOutput");
        break;

      case "Bluetooth":
        window.flutter_inappwebview.callHandler("BluetoothOutput");
        break;

      case "Earpiece":
        window.flutter_inappwebview.callHandler("EarpieceOutput");
        break;

      case "Headphones":
        window.flutter_inappwebview.callHandler("HeadphonesOutput");
        break;

      default:
        window.flutter_inappwebview.callHandler("SpeakerOutput");
        break;
    }
    // }, 1000);
  }

  useEffect(() => {
    if (window?.flutter_inappwebview) {
      if (isIncomingCall && session.state === SessionState.Initial) {
        window.flutter_inappwebview.callHandler("SpeakerOutput");
      } else if (session.state === SessionState.Established) {
        switchMobileOutput();
      }
    }
  }, [mobileSelectedDevice, isIncomingCall, session.state]);

  const isAndroid = isMobile && !checkIsIOSEnv();

  return (
    <div
      className={`w-full right-0 p-4 font-bold bg-yellow-100 border border-primary shadow text-gray-900 rounded`}
    >
      <div
        className={
          "flex flex-col justify-between items-center space-x-2 space-y-4"
        }
      >
        <div className="flex items-center space-x-2">
          <div>
            {isIncomingCall && <PhoneIncoming className={`h-5 w-5`} />}
            {isOutgoingCall && <PhoneOutgoing className={`h-5 w-5`} />}
          </div>
          <div className="flex items-center space-x-2">
            <p>{callMsg.message}</p>
            <div className="relative flex items-center h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </div>
          </div>
        </div>
        {/* <p>{callMsg.clientDetails}</p> */}
        <div className="flex items-center space-x-2">
          <div>{convertCallDurationSeconds(timer)}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="flex items-center justify-center gap-2">
            {!isAndroid ? (
              <AudioOutputSelector />
            ) : (
              <MobileAudioOutputSelector />
            )}
            {isIncomingCall && session.state === SessionState.Initial && (
              <div className="flex items-center space-x-2">
                <Button
                  // variant="success"
                  className="bg-green-500 hover:bg-green-500"
                  onClick={() => {
                    answer();
                    if (window?.flutter_inappwebview) {
                      const webrtcClientName =
                        session.incomingInviteRequest?.message?.headers[
                          "X-Cn"
                        ][0].raw;
                      const webrtcClientId =
                        session.incomingInviteRequest?.message?.headers[
                          "X-Ci"
                        ][0].raw;

                      window.flutter_inappwebview.callHandler(
                        "AcceptCall",
                        webrtcClientId,
                        webrtcClientName
                      );
                    }
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
                    // setCallStatus(intialState);
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneOffIcon size={15} />
                  <span className="ml-2">Reject</span>
                </Button>
              </div>
            )}
            {SessionState.Established === session.state && (
              <div className="flex items-center gap-2">
                <Button
                  className="bg-gray-800 hover:bg-gray-700"
                  onClick={() => {
                    isMuted ? unmute() : mute();
                    ringtoneRef.current.pause();
                  }}
                >
                  {!isMuted ? <MicIcon size={15} /> : <MicOffIcon size={15} />}
                  {/* {isMuted ? 'Ummute' : 'Mute'} */}
                </Button>

                <Button
                  className="bg-gray-800 hover:bg-gray-700"
                  onClick={() => {
                    isHeld ? unhold() : hold();
                    ringtoneRef.current.pause();
                  }}
                >
                  {isHeld ? <PlayIcon size={16} /> : <PauseIcon size={15} />}
                  {/* {isMuted ? 'Unhold' : 'Hold'} */}
                </Button>

                {window.APP_CONFIG.CALL_TRANSFER && (
                  <Button
                    className="bg-gray-800 hover:bg-gray-700"
                    onClick={handleTransfer}
                  >
                    <PhoneForwardedIcon size={15} />
                  </Button>
                )}
              </div>
            )}
          </div>

          {![SessionState.Terminating, SessionState.Terminated].includes(
            session.state
          ) &&
            isOutgoingCall && (
              <div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    hangup();
                    // setCallStatus(intialState);
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneOff size={15} />
                  {/* Hangup */}
                </Button>
              </div>
            )}

          {isIncomingCall &&
            (session.state === "Establishing" ||
              session.state === "Established") && (
              <div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    hangup();
                    // setCallStatus(intialState);
                    ringtoneRef.current.pause();
                  }}
                >
                  <PhoneOff size={15} />
                  {/* Hangup */}
                </Button>
              </div>
            )}
        </div>

        {direction === CallSessionDirection.INCOMING && (
          <audio
            ref={ringtoneRef}
            src="/sounds/ringtone.wav"
            preload="auto"
            loop
          />
        )}
      </div>
    </div>
  );
};

export default MobileCallNotification;
