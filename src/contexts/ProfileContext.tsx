import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useIsMobile, useLocalStorageState } from "@/hooks";
import {
  VTS_LOCAL_STORAGE_PREFERRED_INPUT_DEVICE,
  VTS_LOCAL_STORAGE_PREFERRED_OUTPUT_DEVICE,
} from "@/utils";
import { VTS_LOCAL_STORAGE_PREFERRED_MOBILE_OUTPUT_DEVICE } from "@/utils/constants";
import { checkIsIOSEnv } from "@/lib/utils";

const ProfileContext = createContext(null);

enum AudioType {
  AUDIO_INPUT = "audioinput",
  AUDIO_OUTPUT = "audiooutput",
}

export const ProfileProvider = ({ children }) => {
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [permissionState, setPermissionState] = useState(false);

  const [selectedAudioInput, setSelectedAudioInput] = useLocalStorageState(
    "",
    VTS_LOCAL_STORAGE_PREFERRED_INPUT_DEVICE
  );
  const [selectedAudioOutput, setSelectedAudioOutput] = useLocalStorageState(
    "",
    VTS_LOCAL_STORAGE_PREFERRED_OUTPUT_DEVICE
  );
  const [mobileSelectedDevice, setMobileSelectedDevice] = useLocalStorageState(
    "Speaker",
    VTS_LOCAL_STORAGE_PREFERRED_MOBILE_OUTPUT_DEVICE
  );

  const refAudioRemote = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();
  const isAndroid = isMobile && !checkIsIOSEnv();

  const [openCallRecordingModal, setOpenCallRecordingModal] = useState(false);

  async function updateDevices() {
    try {
      if (checkIsIOSEnv())
        await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = [];
      const audioOutputs = [];
      devices.forEach((device) => {
        if (
          device.kind === AudioType.AUDIO_INPUT &&
          device.deviceId !== "communications"
        ) {
          audioInputs.push(device);
        } else if (
          device.kind === AudioType.AUDIO_OUTPUT &&
          device.deviceId !== "communications"
        ) {
          audioOutputs.push(device);
        }
      });

      setAudioInputs(audioInputs);
      setAudioOutputs(audioOutputs);

      if (!selectedAudioInput && audioInputs.length > 0)
        setSelectedAudioInput(audioInputs[0].deviceId);
      if (!selectedAudioOutput && audioOutputs.length > 0)
        setSelectedAudioOutput(audioOutputs[0].deviceId);
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  }

  // Listen for any device is connected or disconnected
  useEffect(() => {
    if (isAndroid) return;
    updateDevices();

    // Listen for device changes (e.g., a new device is connected)
    navigator.mediaDevices.addEventListener("devicechange", updateDevices);

    // Cleanup event listener on component unmount
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
    };
  }, [isAndroid, permissionState]);

  // Handle audio streaming to selected input device
  useEffect(() => {
    if (selectedAudioInput && !isAndroid) {
      const preferredAudioInput = audioInputs.find(
        (audioInput) => audioInput.deviceId === selectedAudioInput
      );

      if (!refAudioRemote?.current) return;
      if (!Boolean("setSinkId" in refAudioRemote?.current)) return;

      refAudioRemote?.current
        ?.setSinkId(preferredAudioInput?.deviceId)
        .then(() => {
          console.log("Switched to", preferredAudioInput?.label);
        })
        .catch((error) => {
          console.error("Error switching audio input device:", error);
        });
    }
  }, [selectedAudioInput, isAndroid]);

  // Handle audio streaming to selected output device
  useEffect(() => {
    if (selectedAudioOutput && !isAndroid) {
      const preferredAudioOutput =
        audioOutputs?.find(
          (audioOutput) => audioOutput.deviceId === selectedAudioOutput
        ) || {};

      if (!refAudioRemote?.current) return;
      if (!Boolean("setSinkId" in refAudioRemote?.current)) return;

      refAudioRemote?.current
        ?.setSinkId(preferredAudioOutput?.deviceId)
        .then(() => {
          console.log("Switched to", preferredAudioOutput?.label);
        })
        .catch((error) => {
          console.error("Error switching audio output device:", error);
        });
    }
  }, [selectedAudioOutput, isAndroid]);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "microphone",
        });

        setPermissionState(Boolean(permissionStatus.state === "granted"));

        permissionStatus.onchange = () => {
          setPermissionState(Boolean(permissionStatus.state === "granted"));
        };
      } catch (error) {
        console.error("Error checking microphone permission:", error);
      }
    };

    // TODO: Fix permission
    if (navigator.permissions && navigator.permissions.query) {
      checkMicrophonePermission();
    }
  }, []);

  const value = {
    audioInputs,
    audioOutputs,
    refAudioRemote,
    selectedAudioInput,
    selectedAudioOutput,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    mobileSelectedDevice,
    setMobileSelectedDevice,
    openCallRecordingModal,
    setOpenCallRecordingModal,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within an ProfileProvider");
  }
  return context;
};
