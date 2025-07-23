import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { AudioPlayer } from "@/components/audio-player/audio-player";
import { PlayIcon } from "lucide-react";
import globalState from "@/utils/globalState";
import { ICallDetails } from "@/utils/interfaces";

interface AudioPlayerModalProps {
  audioUrl: string;
  title: string;
  setIsPlaying: (val: boolean) => void;
  isPlaying: boolean;
  onClick: () => void;
  handleStop: () => void;
  callDetails: ICallDetails;
}

export function AudioPlayerModal({
  audioUrl,
  isPlaying,
  onClick,
  handleStop,
  setIsPlaying,
  title,
  callDetails,
}: AudioPlayerModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) handleStop();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={onClick} variant="ghost">
          <PlayIcon size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">{title}</DialogTitle>
          <DialogDescription className="font-semibold">
            <div className="grid grid-cols-3 pr-2">
              <p className="">Client ID</p>
              <div className="justify-self-center">:</div>
              <p className="justify-self-end">{callDetails.ClientId}</p>
            </div>

            <div className="grid grid-cols-3 pr-2">
              <p>{globalState.AGENT_NAME} ID</p>
              <div className="justify-self-center">:</div>
              <p className="justify-self-end">{callDetails.UserId}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <AudioPlayer
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onClick={onClick}
        />
      </DialogContent>
    </Dialog>
  );
}
