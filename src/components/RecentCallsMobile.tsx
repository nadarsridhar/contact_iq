import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CallStatusState, getCallStatus } from "@/utils/callStatus";
import { convertDateTime } from "@/utils/dateHelpers";
import { Download, EditIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import HandleCall from "./HandleCall";
import PlayAudio from "./PlayAudio";
import { toast } from "sonner";
import { useEditHistory } from "@/hooks/useEditCallHistory";
import { getCallIcon } from "@/pages/recent-calls/components/columns";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export default function RecentCallsMobile({ callsData }) {
  const { onOpen: handleEditDialogOpen, setData: setUpdateClientDetailsData } =
    useEditHistory();
  const { token } = useAuth();
  const {
    isClickToCallAllowed,
    isAMICallAllowed,
    isRecordingDownloadAllowed,
    isViewRecordingAllowed,
  } = usePrivilege();

  const downloadAudio = async (RecordingName) => {
    // Fetch the audio file using axios

    try {
      const BASE_URL = window.APP_CONFIG.API_URL;

      let headersConfig = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (!token) delete headersConfig["Authorization"];

      fetch(`${BASE_URL}/v1/recordings/getRecording`, {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify({ RecordingName }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch audio file");
          }
          return response.blob();
        })
        .then((blob) => {
          // Create a URL for the Blob and set it as the audio source
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = RecordingName; // Default filename
          document.body.appendChild(link);
          link.click(); // Programmatically click the link to trigger download
          document.body.removeChild(link); // Clean up the link element
          window.URL.revokeObjectURL(url); // Release blob URL
          toast.success(`Recording downloaded successfully`);
        })
        .catch((error) => {
          console.error("Error downloading call recording:", error);
          toast.error("Failed to download call recording");
        });
    } catch (error) {
      console.error("Error downloading call recording:", error);
      toast.error("Failed to download call recording");
    }
  };

  const handleEdit = (call) => {
    handleEditDialogOpen();
    setUpdateClientDetailsData(call);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden my-2">
      <ScrollArea>
        <ul className="divide-y divide-gray-200">
          {callsData.map((call, index) => {
            const callStatus = getCallStatus(call.CallStatus, call.CallType);
            let callTypeIcon = getCallIcon(
              call.CallStatus,
              call.CallType,
              callStatus.textColor,
              "h-3"
            );

            const startTime = Number(call.StartTime);
            const endTime = Number(call.endTime);
            const duration = call.Duration;
            const formattedStartTime = convertDateTime(call.StartTime, false);

            if (
              index === 0 &&
              (call.CallStatus == CallStatusState.INCOMING ||
                call.CallStatus == CallStatusState.UNANSWERED)
            ) {
              callTypeIcon = (
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="#EF4444"
                    className="animate-pulse"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="7"
                    stroke="#EF4444"
                    strokeWidth="2"
                  />
                </svg>
              );
            }

            return (
              <Accordion type="single" collapsible className="w-full p-0">
                <AccordionItem className="p-0" value="item-1">
                  <AccordionTrigger className="p-0 px-2">
                    <li
                      key={call.id}
                      className="p-4 flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
                    >
                      <div className="flex justify-between items-center space-x-4 w-full">
                        <div className="flex gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              alt={
                                call.ClientName
                                  ? call.ClientId
                                  : call.ClientName
                              }
                              className="rounded-full"
                            />
                            <AvatarFallback className="border-2  bg-primary text-green-100">
                              {call.ClientName
                                ? call.ClientName?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : call.ClientId?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate mb-1">
                              {call.ClientName
                                ? call.ClientName
                                : call.ClientId}
                            </p>
                            <div className="flex items-center gap-1">
                              <p>{callTypeIcon}</p>
                              <p className="text-xs text-gray-700 truncate">
                                {formattedStartTime}
                              </p>
                            </div>
                          </div>
                        </div>
                        {(isClickToCallAllowed || isAMICallAllowed) && (
                          <div className="flex flex-col items-end">
                            <HandleCall call={call} />
                          </div>
                        )}
                      </div>
                    </li>
                  </AccordionTrigger>
                  <AccordionContent className="mx-4 rounded-lg border border-gray-300 p-3 mb-4">
                    <div className="flex justify-between items-start rounded-lg mb-2">
                      <p className="text-sm">Client ID</p>
                      <p>{call.ClientId}</p>
                    </div>
                    <div className="flex justify-between items-start rounded-lg mb-2">
                      <p className="text-sm">Phone number</p>
                      <p>{call.ClientNumber}</p>
                    </div>
                    <div className="flex justify-between items-start rounded-lg mb-2">
                      <p className="text-sm">
                        {isViewRecordingAllowed && <span>Call Recording</span>}
                        <span className="text-xs">&nbsp;({duration})</span>{" "}
                      </p>
                      <div className="flex items-start gap-2">
                        {isViewRecordingAllowed && <PlayAudio row={call} />}
                        {isRecordingDownloadAllowed && (
                          <Download
                            onClick={() => downloadAudio(call.RecordingName)}
                            className="h-5 w-5"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between rounded-lg mb-2">
                      <p className="text-sm">Edit Details</p>
                      <div className="flex gap-2">
                        <EditIcon
                          onClick={() => handleEdit(call)}
                          className="h-5 w-5"
                        />
                      </div>
                    </div>

                    <div>
                      {/* <p className="text-sm">Remarks</p> */}
                      <p className="text-gray-600">{call.Remarks}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
