import { CallStatusState } from "@/utils";
import { Button } from "./ui/button";
import { PlayIcon } from "lucide-react";
import { useRecordingModal } from "@/hooks/useRecordingModal";
import { useSIPProvider } from "./SipProvider";

function PlayAudio({ row: callDetails }) {
  const { isOpen, onOpen, setData } = useRecordingModal();
  const { sessionManager } = useSIPProvider();
  const activeSessionId = sessionManager?.managedSessions[0]?.session?.id;

  const handleModalOpen = () => {
    setData(callDetails);
  };

  if (callDetails.CallStatus !== CallStatusState.HANGUP) return;

  return (
    <div>
      <Button
        className="h-8 flex items-center gap-1 border md:border-none bg-white md:bg-none"
        disabled={Boolean(activeSessionId)}
        onClick={handleModalOpen}
        variant="ghost"
      >
        <PlayIcon size={12} />
      </Button>
    </div>
  );
}

export default PlayAudio;
