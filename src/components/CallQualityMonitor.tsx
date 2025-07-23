import { useEffect, useRef, useState } from "react";
import { useSessionCall } from "./SipProvider";

const CallQualityMonitor = ({ sessionId }) => {
  const { session } = useSessionCall(sessionId);
  const [quality, setQuality] = useState({});
  const intervalRef = useRef(null);

  const getCallStats = async () => {
    try {
      const pc = session.sessionDescriptionHandler.peerConnection;

      if (!pc) return;

      const stats = await pc.getStats();
      let outboundRtp;
      let inboundRtp;
      let remoteCandidate;
      let localCandidate;

      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && report.kind === "audio") {
          inboundRtp = report;
        }
        if (report.type === "outbound-rtp" && report.kind === "audio") {
          outboundRtp = report;
        }
        if (report.type === "candidate-pair" && report.state === "succeeded") {
          remoteCandidate = stats.get(report.remoteCandidateId);
          localCandidate = stats.get(report.localCandidateId);
        }
      });

      const qualityData = {
        jitter: inboundRtp?.jitter,
        packetsLost: inboundRtp?.packetsLost,
        roundTripTime: outboundRtp?.roundTripTime,
        codec: inboundRtp?.codecId
          ? stats.get(inboundRtp.codecId)?.mimeType
          : undefined,
        localCandidate: localCandidate?.ip,
        remoteCandidate: remoteCandidate?.ip,
      };

      setQuality(qualityData);
    } catch (err) {
      console.error("Error getting stats:", err);
    }
  };

  useEffect(() => {
    if (!session || !session.sessionDescriptionHandler) return;

    intervalRef.current = setInterval(getCallStats, 3000); // poll every 3s

    return () => clearInterval(intervalRef.current);
  }, [session]);

  return (
    <div>
      <h3>Call Quality Monitor</h3>
      <ul>
        <li>Jitter: {quality.jitter}</li>
        <li>Packets Lost: {quality.packetsLost}</li>
        <li>RTT: {quality.roundTripTime}</li>
        <li>Codec: {quality.codec}</li>
        <li>Local IP: {quality.localCandidate}</li>
        <li>Remote IP: {quality.remoteCandidate}</li>
      </ul>
    </div>
  );
};

export default CallQualityMonitor;
