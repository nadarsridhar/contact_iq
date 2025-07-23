import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/contexts/ProfileContext";
import {
  BluetoothIcon,
  HeadphonesIcon,
  PhoneCall,
  SpeakerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileAudioOutputSelector() {
  const { mobileSelectedDevice, setMobileSelectedDevice } = useProfileContext();

  const handleDeviceChange = (deviceId: string) => {
    setMobileSelectedDevice(deviceId);
  };

  const mobileOutputDevices = [
    {
      icon: <BluetoothIcon className="h-4 w-4" />,
      value: "Bluetooth",
      onClick: () =>
        window?.flutter_inappwebview?.callHandler("BluetoothOutput") ?? {},
    },
    {
      icon: <SpeakerIcon className="h-4 w-4" />,
      value: "Speaker",
      onClick: () =>
        window?.flutter_inappwebview?.callHandler("SpeakerOutput") ?? {},
    },
    {
      icon: <PhoneCall className="h-4 w-4" />,
      value: "Earpiece",
      onClick: () =>
        window?.flutter_inappwebview?.callHandler("EarpieceOutput") ?? {},
    },
    {
      icon: <HeadphonesIcon className="h-4 w-4" />,
      value: "Headphones",
      onClick: () =>
        window?.flutter_inappwebview?.callHandler("HeadphonesOutput") ?? {},
    },
  ];

  let icon = mobileOutputDevices.find(
    (o) => o.value.toLowerCase() === mobileSelectedDevice.toLowerCase()
  )?.icon;

  return (
    <div>
      <div className="flex items-center">
        <Select value={mobileSelectedDevice} onValueChange={handleDeviceChange}>
          <SelectTrigger className="bg-gray-800 hover:bg-gray-700 text-gray-50">
            {/* <SelectValue placeholder="Select audio output" /> */}
            {icon}
          </SelectTrigger>
          <SelectContent>
            {mobileOutputDevices.map((device) => {
              return (
                <SelectItem
                  className=""
                  key={device.value}
                  value={device.value}
                >
                  <Button
                    key={device.value}
                    variant="outline"
                    onClick={() => {
                      if (window?.flutter_inappwebview) {
                        device.onClick();
                      }
                    }}
                    className="flex items-center space-x-2 w-full "
                  >
                    <div>{device.icon}</div>
                    <div>{device.value}</div>
                  </Button>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
