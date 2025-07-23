import { ReactNode, useCallback, useState } from "react";
import { Inviter } from "sip.js";
import { Session } from "sip.js/lib/api/session";
import { SessionManager } from "sip.js/lib/platform/web";

import {
  RegisterStatus,
  SIPAccount,
  SIPProviderOptions,
  CONNECT_STATUS,
  SessionTimer,
  SessionDirection,
} from "../components/type";
import { ProviderContext } from "@/components/SipProvider";
import { useProfileContext } from "./ProfileContext";

export enum ErrorMessageLevel1 {
  SIP_PROVIDER = "sip-provider",
}

export enum ErrorMessageLevel2 {
  FAILED_CONNECT_SIP_USER = `Can't connect with SIP Server`,
}

export const SIPProvider = (props: {
  options: SIPProviderOptions;
  children: ReactNode | JSX.Element;
}): React.ReactNode => {
  const { options, children } = props;
  const { refAudioRemote, mobileSelectedDevice } = useProfileContext();

  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [activeSession, setActiveSession] = useState<Session>({});
  const [sessionTimer, setSessionTimer] = useState<SessionTimer>({});
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(
    null
  );
  const [connectStatus, setStatus] = useState<CONNECT_STATUS>(
    CONNECT_STATUS.WAIT_REQUEST_CONNECT
  );
  const [registerStatus, setRegisterStatus] = useState<RegisterStatus>(
    RegisterStatus.UNREGISTERED
  );
  const [isActiveCall, setIsActiveCall] = useState(false);

  const updateSession = useCallback(
    (session: Session) => {
      setSessions((sessions) => ({
        ...sessions,
        [session.id]: session,
      }));
    },
    [setSessions]
  );

  const updateActiveSession = useCallback(
    (session: Session) => {
      setActiveSession(session);
    },
    [setActiveSession]
  );

  const connectAndRegister = useCallback((sipAccount: SIPAccount) => {
    const ICE_SERVER = window.APP_CONFIG.ICE_SERVER;

    const sessionManager = new SessionManager(options.webSocketServer, {
      aor: `sip:${sipAccount.username}@${options.domain}`,
      userAgentOptions: {
        authorizationUsername: sipAccount.username,
        authorizationPassword: sipAccount.password,
      },
      media: {
        constraints: {
          audio: {
            echoCancellation: { exact: true },
            noiseSuppression: { exact: true },
            autoGainControl: { exact: true },
          },
          video: false,
        },
        remote: {
          audio: refAudioRemote.current as HTMLAudioElement,
        },
      },
      iceCheckingTimeout: 1000,
      rtcConfiguration: { iceServers: [{ urls: ICE_SERVER }] },
      delegate: {
        onCallCreated: (session) => {
          window.callLogger = {};
          const webrtcClientName =
            session?.incomingInviteRequest?.message?.headers["X-Cn"][0].raw ??
            "";
          const webrtcClientId =
            session?.incomingInviteRequest?.message?.headers["X-Ci"][0].raw ??
            "";
          window.callLogger.answer = () => {
            sessionManager?.answer(session);
            if (window?.flutter_inappwebview) {
              window.flutter_inappwebview.callHandler(
                "AcceptCall",
                webrtcClientId,
                webrtcClientName
              );
            }
          };
          window.callLogger.decline = () => sessionManager?.decline(session);
          window.callLogger.hangup = () => sessionManager?.hangup(session);
          window.callLogger.mute = () => sessionManager?.mute(session);
          window.callLogger.unmute = () => sessionManager?.unmute(session);
          session.stateChange.addListener((state) => {
            console.info(
              ErrorMessageLevel1.SIP_PROVIDER,
              `Session ${session.id} changed to ${state}`
            );
            updateSession(session);
            updateActiveSession(session);
          });
          updateSession(session);
          updateActiveSession(session);
          setSessionTimer((timer) => ({
            ...timer,
            [session.id]: {
              createdAt: new Date(),
            },
          }));
        },
        onCallAnswered: (session) => {
          updateSession(session);
          updateActiveSession(session);
          setSessionTimer((timer) => ({
            ...timer,
            [session.id]: {
              ...(timer[session.id] || {}),
              answeredAt: new Date(),
            },
          }));
        },
        onCallHangup: (session) => {
          updateSession(session);
          updateActiveSession(null);
          if (window?.flutter_inappwebview) {
            const direction =
              session instanceof Inviter
                ? SessionDirection.OUTGOING
                : SessionDirection.INCOMING;

            window.flutter_inappwebview.callHandler(
              "HangupCall",
              direction === SessionDirection.INCOMING ? "Incoming" : "Outgoing"
            );
          }
          setSessionTimer((timer) => ({
            ...timer,
            [session.id]: {
              ...(timer[session.id] || {}),
              hangupAt: new Date(),
            },
          }));
        },
        onCallReceived: (session) => {
          window.callLogger = {};
          const webrtcClientName =
            session?.incomingInviteRequest?.message?.headers["X-Cn"][0].raw ??
            "";
          const webrtcClientId =
            session?.incomingInviteRequest?.message?.headers["X-Ci"][0].raw ??
            "";
          window.callLogger.answer = () => {
            sessionManager?.answer(session);
            if (window?.flutter_inappwebview) {
              window.flutter_inappwebview.callHandler(
                "AcceptCall",
                webrtcClientId,
                webrtcClientName
              );
            }
          };
          window.callLogger.decline = () => sessionManager?.decline(session);
          window.callLogger.hangup = () => sessionManager?.hangup(session);
          window.callLogger.mute = () => sessionManager?.mute(session);
          window.callLogger.unmute = () => sessionManager?.unmute(session);
          updateSession(session);
          updateActiveSession(session);
          if (window?.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler("StopRingtone");
            window.flutter_inappwebview.callHandler(
              "WebViewToFlutter",
              "triggerNotification",
              webrtcClientId,
              webrtcClientName
            );
          }
          setSessionTimer((timer) => ({
            ...timer,
            [session.id]: {
              ...(timer[session.id] || {}),
              receivedAt: new Date(),
            },
          }));
        },
        onRegistered: () => {
          setRegisterStatus(RegisterStatus.REGISTERED);
        },
        onUnregistered: () => {
          setRegisterStatus(RegisterStatus.UNREGISTERED);
        },
        onServerConnect() {
          setStatus(CONNECT_STATUS.CONNECTED);
          sessionManager.register();
        },
        onServerDisconnect(error) {
          console.error(
            ErrorMessageLevel1.SIP_PROVIDER,
            ErrorMessageLevel2.FAILED_CONNECT_SIP_USER,
            error
          );
          setStatus(CONNECT_STATUS.DISCONNECTED);
          sessionManager.unregister();
        },
      },
    });

    setSessionManager(sessionManager);
    sessionManager.connect();
  }, []);

  return (
    <>
      <ProviderContext.Provider
        value={{
          connectAndRegister,
          sessionManager,
          connectStatus,
          registerStatus,
          sessions,
          sessionTimer,
          isActiveCall,
          setIsActiveCall,
          setRegisterStatus,
          setSessionManager,
          activeSession,
        }}
      >
        {children}
      </ProviderContext.Provider>
      <audio ref={refAudioRemote} />
    </>
  );
};
