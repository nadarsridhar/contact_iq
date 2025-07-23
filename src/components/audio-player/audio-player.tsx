import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  setIsPlaying: (val: boolean) => void;
  isPlaying: boolean;
  onClick: () => void;
}

export function AudioPlayer({
  audioUrl,
  onClick,
  isPlaying,
  setIsPlaying,
}: AudioPlayerProps) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    // Events
    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [audioRef]);

  // Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle progress change
  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current) return;

    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;

    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!audioRef.current) return;

    const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        autoPlay
        onEnded={() => setIsPlaying(false)}
      />

      {/* Progress bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleProgressChange}
          className="my-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => skip(10)}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
