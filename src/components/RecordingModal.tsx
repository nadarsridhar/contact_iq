import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecordingModal } from "@/hooks/useRecordingModal";
import globalState from "@/utils/globalState";
import { AudioPlayer } from "./audio-player/audio-player";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useSIPProvider } from "./SipProvider";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useAuth } from "@/contexts/AuthContext";

export function RecordingModal() {
  const {
    onClose,
    data: callDetails,
    setData,
    isOpen,
    onOpen: handleOpenModal,
    onClose: handleCloseModal,
  } = useRecordingModal();

  const [audioUrl, setAudioUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [recordingData, setRecordingData] = useState({});

  const { token } = useAuth();
  const { isWebrtcAllowed } = usePrivilege();
  const { sessionManager } = useSIPProvider();

  const activeSessionId = sessionManager?.managedSessions[0]?.session?.id;

  const BASE_URL = window.APP_CONFIG.API_URL;

  const handleStop = () => {
    setAudioUrl("");
    audioRef.current = null;
    setIsPlaying(false);
  };

  const handlePlay = async (RecordingName: string) => {
    if (!RecordingName) {
      toast.error("Please enter a file path");
      return;
    }
    if (isFetching) return;

    try {
      setIsFetching(true);
      let headersConfig = {
        "Content-Type": "application/json",
        Authorization: `${token ? `Bearer ${token}` : ""}`,
      };
      if (!token) delete headersConfig["Authorization"];

      const response = await fetch(
        `${BASE_URL}/v1/recordings/streamRecording`,
        {
          method: "POST",
          headers: headersConfig,
          body: JSON.stringify({ RecordingName }),
        }
      );

      if (!response.ok) {
        toast.error("File not found!");
        throw new Error("File not found!");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      // handlePlayRecording(callDetails.UniqueCallIdentifier);
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setIsPlaying(true);
      toast.success(`Playing recording`);
      handleOpenModal();
    } catch (error) {
      handleStop();
      handleCloseModal();
      console.error("Error streaming audio:", error);
      toast.error("Error playing recording");
    } finally {
      setIsFetching(false);
    }
  };

  const handlePlayStopRecording = () => {
    if (isOpen) handleCloseModal();
    else handleOpenModal();

    if (isPlaying) handleStop();
    else handlePlay(callDetails?.RecordingName);
  };

  const handleClear = () => {
    handleCloseModal();
    setData([]);
  };

  useEffect(() => {
    if (isWebrtcAllowed && activeSessionId) {
      handleClear();
    }
  }, [isWebrtcAllowed, activeSessionId]);

  useEffect(() => {
    if (callDetails?.RecordingName) {
      handlePlay(callDetails?.RecordingName);
      setRecordingData(callDetails);
    }

    return () => handleClear();
  }, [callDetails?.RecordingName]);

  return (
    <Dialog open={isOpen} modal defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">
            Call Recording
          </DialogTitle>

          <DialogDescription className="font-semibold">
            <div className="grid grid-cols-3 pr-2">
              <p className="">Client ID</p>
              <div className="justify-self-center">:</div>
              <p className="justify-self-end">{recordingData.ClientId}</p>
            </div>

            <div className="grid grid-cols-3 pr-2">
              <p>{globalState.AGENT_NAME} ID</p>
              <div className="justify-self-center">:</div>
              <p className="justify-self-end">{recordingData.UserId}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <AudioPlayer
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onClick={handlePlayStopRecording}
        />
        <DialogFooter>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
