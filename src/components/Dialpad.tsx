import { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useSIPProvider } from "./SipProvider";
import { useAuth } from "@/contexts/AuthContext";
import DialpadCTA from "./icons/DialpadCTA";
import { Input } from "./ui/input";
import { useIsMobile } from "@/hooks";
import globalState from "@/utils/globalState";
import { makeCallApi } from "@/services/apiCalls";
import { toast } from "sonner";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useShortcut } from "@/hooks/useShortcut";
import { RegisterStatus } from "@/utils";

const dialPadButtons = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
];

export default function DialPad() {
  const [number, setNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { agent, setActiveCall } = useAuth();
  const { sessionManager, isActiveCall, registerStatus } = useSIPProvider();
  const dialPadRef = useRef(null);
  const isMobile = useIsMobile();
  const { isAMICallAllowed } = usePrivilege();

  const handleAMICall = async () => {
    try {
      const payload = {
        AgentNumber: agent.UserMobileNumber,
        AgentId: agent.UserId,
        ClientId: `DP_${number}`,
        ClientNumber: number,
        ClientName: globalState.DIALPAD,
        IsDialpadCall: 1,
      };
      const response = await makeCallApi(payload);
      if (response && response.status !== "success") {
        toast.error(JSON.parse(response.response.data).error);
        throw new Error(JSON.parse(response.response.data).error);
      }
      toast.success("Connecting call..");
    } catch (error) {
      console.error("Error while making AMI calls", error);
    }
  };

  const handleCall = async () => {
    setIsOpen(false);
    if (number.length !== 10) return;

    if (isAMICallAllowed || registerStatus === RegisterStatus.UNREGISTERED) {
      handleAMICall();
    } else {
      try {
        setActiveCall({
          ClientId: "",
          ClientName: "",
          ClientNumber: number,
          IsDialpadCall: true,
        });
        const SIP_URL = window.APP_CONFIG.SIP_HOST;

        const customHeaders = [
          `DI: ${agent.UserId}`,
          `DN: ${agent.UserMobileNumber}`,
          `CN: ${number}`,
          `CI: DP_${number}`,
          `CNM: ${globalState.DIALPAD}`,
          `IS_DIALPAD_CALL: 1`,
        ];

        const inviterOptions = { extraHeaders: customHeaders };
        console.log("Initiating dialpad call..");
        await sessionManager?.call(
          `sip:${agent.UserMobileNumber}@${SIP_URL}`,
          inviterOptions
        );
      } catch (error) {
        console.error("Failed while initiating call", error);
      } finally {
        setNumber("");
      }
    }
  };

  const handleEnterEvent = (e) => {
    if (e.key == "Enter" && number.length === 10) {
      e.preventDefault();
      handleCall();
    }
  };

  const handleNumberClick = (digit: string) => {
    if (number.length >= 10) return;
    setNumber((prev) => prev + digit);
  };

  const handleChange = (event) => {
    const inputValue = event.target.value;

    // Regular expression to allow only numeric values
    const numericValue = inputValue.replace(/\D/g, "");

    // Limit input to 10 characters
    if (numericValue.length <= 10) {
      setNumber(numericValue);
    }
  };

  useEffect(() => {
    if (isOpen && dialPadRef.current) {
      dialPadRef.current.focus();
    }
  }, [isOpen]);

  useShortcut("f1", () => {
    if (isActiveCall) return;
    setIsOpen(!isOpen);
  });

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          disabled={isActiveCall}
          className="z-20 fixed bottom-16 right-8 md:right-16 p-3 py-6"
        >
          <DialpadCTA />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex justify-end sm:w-[540px] left-0 right-0 md:left-auto md:right-40">
        <DrawerHeader>
          <DrawerTitle className="text-2xl">Dialpad</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          {isMobile ? (
            <Input
              autoFocus
              type="number"
              className="py-6 mb-4 text-xl text-center"
              value={number}
              onKeyDown={handleEnterEvent}
              maxLength={10}
              minLength={10}
              onChange={handleChange}
            />
          ) : (
            <>
              <Input
                type="text"
                value={number}
                onChange={handleChange}
                placeholder="Enter number"
                ref={dialPadRef}
                className="py-6 mb-4 text-xl"
                onKeyDown={handleEnterEvent}
                maxLength={10}
                minLength={10}
                autoFocus
                onClear={() => setNumber("")}
                onClearClassName="bottom-8"
              />

              <div className="grid grid-cols-3 gap-4">
                {dialPadButtons.map((digit) => (
                  <Button
                    key={digit}
                    variant="outline"
                    className="text-2xl h-16 border border-primary hover:bg-gray-200"
                    onClick={() => handleNumberClick(digit)}
                    disabled={digit === "*" || digit === "#"}
                  >
                    {digit}
                  </Button>
                ))}
              </div>
            </>
          )}

          <div className="mt-4">
            <Button
              className="w-full py-6"
              onClick={handleCall}
              disabled={!number || number.length != 10}
            >
              <Phone className="mr-2 h-4 w-4" /> Dial
            </Button>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              onClick={() => setNumber("")}
              className="py-5"
              variant="outline"
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
