import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useLocalStorageState } from "@/hooks";
import { VTS_LOCAL_STORAGE_PREFERRED_MOBILE_OUTPUT_DEVICE } from "@/utils/constants";
import { BluetoothIcon, PhoneCallIcon, SpeakerIcon } from "lucide-react";

export default function AudioOutputSelector() {
  const [selectedDevice, setSelectedDevice] = useState("");
  const { audioOutputs, selectedAudioOutput, setSelectedAudioOutput } =
    useProfileContext();
  const [mobileSelectedDevice, setMobileSelectedDevice] = useLocalStorageState(
    null,
    VTS_LOCAL_STORAGE_PREFERRED_MOBILE_OUTPUT_DEVICE
  );

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setSelectedAudioOutput(deviceId);
  };

  useEffect(() => {
    setSelectedDevice(selectedAudioOutput);
  }, [selectedAudioOutput, mobileSelectedDevice]);

  if (audioOutputs?.length > 0 && audioOutputs[0].deviceId === "") return null;

  const { label: selectedAudioOutputLabel } =
    audioOutputs?.find((o) => o.deviceId === selectedAudioOutput) || {};
  let icon;
  if (selectedAudioOutputLabel?.trim()?.toLowerCase().includes("bluetooth")) {
    icon = <BluetoothIcon size={16} />;
  } else if (
    selectedAudioOutputLabel?.trim()?.toLowerCase().includes("phone") ||
    selectedAudioOutputLabel?.trim()?.toLowerCase().includes("earpiece")
  ) {
    icon = <PhoneCallIcon size={16} />;
  } else {
    icon = <SpeakerIcon size={16} />;
  }

  return (
    <Select value={selectedDevice} onValueChange={handleDeviceChange}>
      <SelectTrigger className="bg-gray-800 hover:bg-gray-700 text-gray-50">
        {icon}
      </SelectTrigger>
      <SelectContent>
        {audioOutputs.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId}>
            {device.label || `Audio Output ${device.deviceId.slice(0, 5)}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
