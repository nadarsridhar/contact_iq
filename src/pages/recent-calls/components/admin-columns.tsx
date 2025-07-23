import { ColumnDef } from "@tanstack/react-table";

import { Call } from "../../../schemas/call";
import { DataTableColumnHeader } from "../../clients/components/data-table-column-header";
import {
  CalendarClockIcon,
  Download,
  EarthIcon,
  EditIcon,
  EyeIcon,
  Headphones,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Play,
  Smartphone,
} from "lucide-react";
import {
  CallStatusState,
  CallType,
  getCallStatus,
  RegisterStatus,
} from "@/utils/callStatus";
import PlayAudio from "@/components/PlayAudio";
import HandleCall from "@/components/HandleCall";
import { Badge } from "@/components/ui/badge";
import { convertDateTime, formatDuration } from "@/utils/dateHelpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEditHistory } from "@/hooks";
import downloadFile from "@/utils/downloadFile";
import globalState from "@/utils/globalState";
import { trimString } from "@/lib/utils";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { makeCallApi } from "@/services/apiCalls";
import { useSIPProvider } from "@/components/SipProvider";
import FollowUp from "../../../../public/SVGs/FollowUp.svg";
import {
  useCreateFollowup,
  useFollowupDetails,
} from "@/hooks/useCreateFollowup";
import { ACTIONS } from "@/utils/actions";

export const getCallIcon = (
  callStatus: number,
  callType: number,
  textColor: string,
  className?: string
) => {
  if (
    callType == CallStatusState.INCOMING &&
    callStatus == CallStatusState.UNANSWERED
  ) {
    return <PhoneMissed className={`h-4 w-4 ${textColor} ${className}`} />;
  } else if (callType == CallStatusState.INCOMING) {
    return <PhoneIncoming className={`h-4 w-4 ${textColor} ${className}`} />;
  } else if (callType == CallStatusState.ANSWERED) {
    return <PhoneOutgoing className={`h-4 w-4 ${textColor} ${className}`} />;
  }
};

export const desktopColumns: ColumnDef<Call>[] = [
  {
    id: "call-actions",
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="Click to call" />
    // ),
    enableResizing: true,
    size: 40,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const { isClickToCallAllowed, isAMICallAllowed, isWebrtcAllowed } =
        usePrivilege();
      const { registerStatus } = useSIPProvider();
      const isCallingAllowed =
        isClickToCallAllowed ||
        isAMICallAllowed ||
        isWebrtcAllowed ||
        registerStatus === RegisterStatus.UNREGISTERED;

      return (
        <div className="pl-1 flex items-center ">
          {isCallingAllowed && <HandleCall call={row.original} />}
          <div className="flex items-center">
            {row.original.WebRTCCall === 1 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <EarthIcon size={12} className="text-gray-500 mr-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">VOIP call</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="mr-6"></div>
            )}
            {/* {isIncoming && <Incoming className="size-5" />}
            {isOutgoing && <Outgoing className="size-5" />} */}
            {row.original.IsFollowupScheduled && (
              <CalendarClockIcon className="size-5 text-gray-500" />
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "call-status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableResizing: true,
    size: 80,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const callStatus = getCallStatus(
        row.original.CallStatus,
        row.original.CallType
      );
      let callTypeIcon = getCallIcon(
        Number(row.original.CallStatus),
        Number(row.original.CallType),
        callStatus.textColor
      );

      if (
        row.index === 0 &&
        (row.original.CallStatus == CallStatusState.INCOMING ||
          row.original.CallStatus == CallStatusState.ANSWERED)
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
            <circle cx="12" cy="12" r="7" stroke="#EF4444" strokeWidth="2" />
          </svg>
        );
      }

      return (
        <div className="flex items-center">
          <Badge
            variant="secondary"
            className={`flex items-center space-x-1 ${callStatus.bgColor} ${callStatus.border}`}
          >
            <span>{callTypeIcon}</span>
            <span>{callStatus.statusText}</span>
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`${globalState.AGENT_NAME} ID`}
      />
    ),
    enableResizing: true,
    size: 70,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.original.UserId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    enableResizing: true,
    size: 80,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const { agent, setActiveCall } = useAuth();
      const { isAMICallAllowed, isClickToCallAllowed, isWebrtcAllowed } =
        usePrivilege();
      const { sessionManager, registerStatus } = useSIPProvider();

      const isCallingAllowed =
        (isClickToCallAllowed || isAMICallAllowed || isWebrtcAllowed) &&
        window.APP_CONFIG.CLIENT_CTC;

      const handleCall = async () => {
        if (!isCallingAllowed) return;

        const callPayload = row.original;
        try {
          setActiveCall(callPayload);
          const SIP_URL = window.APP_CONFIG.SIP_HOST;
          let {
            ClientId,
            ClientName,
            ClientNumber = "",
            IsDialpadCall,
          } = callPayload;

          // AMI call
          if (
            isAMICallAllowed ||
            registerStatus === RegisterStatus.UNREGISTERED
          ) {
            const payload = {
              AgentNumber: agent.UserMobileNumber,
              AgentId: agent.UserId,
              ClientName,
              ClientId,
              ClientNumber,
              IsDialpadCall,
            };
            const response = await makeCallApi(payload);
            if (response && response.status !== "success") {
              toast.error(JSON.parse(response.response.data).error);
              throw new Error(JSON.parse(response.response.data).error);
            }
            toast.success("Connecting call..");
          }
          // Webrtc call
          else {
            const customHeaders = [
              `DI: ${agent.UserId}`,
              `DN: ${agent.UserMobileNumber}`,
              `CN: ${ClientNumber}`,
              `CI: ${ClientId}`,
              `CNM: ${ClientName}`,
              `IS_DIALPAD_CALL: ${IsDialpadCall}`,
            ];

            let sipUri = `sip:${agent.UserMobileNumber}@${SIP_URL}`;

            const inviterOptions = { extraHeaders: customHeaders };
            await sessionManager?.call(sipUri, inviterOptions);

            if (window?.flutter_inappwebview) {
              window.flutter_inappwebview.callHandler(
                "OutgoingCall",
                ClientId,
                ClientName
              );
            }
          }
        } catch (error) {
          console.log(error.message);
          if (error.message === "Permission denied") {
            toast.error(`Kindly enable microphone permissions`);
            return;
          }
          console.error("Failed while initiating call", error);
        }
      };

      return (
        <div
          onClick={handleCall}
          className={`flex items-center w-full  ${
            isCallingAllowed
              ? "cursor-pointer transition-all duration-200 hover:text-green-700 hover:font-semibold"
              : ""
          }`}
        >
          <span>
            {row.original.ClientId}
            {row.original.TaggedClientIds && "," + row.original.TaggedClientIds}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    enableResizing: true,
    size: 80,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.original.ClientName}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "ClientNumber",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Client Number" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex">
  //         <span className="font-medium">{row.original.ClientNumber}</span>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Branch" />
    ),
    enableResizing: true,
    size: 70,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex">
          <span className="font-medium">{row.original.BranchName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    enableResizing: true,
    size: 40,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate font-medium">
            {formatDuration(row.original.Duration)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "StartTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Call Time" />
    ),
    enableResizing: true,
    size: 80,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const formattedStartTime = convertDateTime(row.original.StartTime);
      return <span className="truncate font-medium">{formattedStartTime}</span>;
    },
  },
  {
    accessorKey: "Remarks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remarks" />
    ),
    enableResizing: true,
    size: 50,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-gray-950 text-sm">
                  {trimString(row.getValue("Remarks"), 15)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">
                  Updated by {row.original.UpdatedBy}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableResizing: true,
    size: 30,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const { isViewRecordingAllowed } = usePrivilege();
      return (
        <div className="flex justify-end items-center h-8">
          {isViewRecordingAllowed &&
            Number(row.original.CallStatus) === CallStatusState.HANGUP && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <PlayAudio row={row.original} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">Play Recording</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

          {/* <DataTableRowActions row={row} /> */}
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<Call>[] = [
  {
    id: "call-actions",
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="Click to call" />
    // ),
    cell: ({ row }) => {
      const { token } = useAuth();
      const {
        onOpen: handleEditDialogOpen,
        setData: setUpdateClientDetailsData,
      } = useEditHistory();
      const {
        onOpen: openCreateFollowupDialog,
        setData: setCreateFollowupTask,
      } = useCreateFollowup();
      const {
        onOpen: openFollowupDetailsDialog,
        setData: setFollowupDetailsData,
      } = useFollowupDetails();

      const {
        isClickToCallAllowed,
        isPhoneNumberAllowed,
        isViewRecordingAllowed,
        isRecordingDownloadAllowed,
        isAMICallAllowed,
        isFollowupTaskAllowed,
      } = usePrivilege();

      const {
        ClientId,
        ClientName,
        ClientNumber,
        RecordingName,
        Remarks,
        CallStatus,
        CallType,
        StartTime,
        Duration,
        BranchName,
      } = row.original;

      const callStatus = getCallStatus(CallStatus, CallType);
      let callTypeIcon = getCallIcon(
        CallStatus,
        CallType,
        callStatus.textColor,
        "h-3"
      );
      const formattedStartTime = convertDateTime(StartTime, false, true);

      const handleEdit = (call: Call) => {
        handleEditDialogOpen();
        setUpdateClientDetailsData(call);
      };

      const handleCreateFollowUp = (row) => {
        openCreateFollowupDialog();
        setCreateFollowupTask({
          ...row.original,
          OperationCode: ACTIONS.CREATE,
        });
      };

      const handleViewFollowUpDialog = (row) => {
        openFollowupDetailsDialog();
        setFollowupDetailsData(row.original);
      };

      const downloadAudio = async (RecordingName: string) => {
        try {
          await downloadFile(
            "v1/recordings/getRecording",
            { RecordingName },
            RecordingName,
            token
          );
        } catch (error) {
          console.error(`Error while downloading audio`);
        }
      };

      const { DynamicWidth } = useAuth();

      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem
            value="item-1"
            className="border rounded-lg mb- overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <AccordionTrigger
              showIcon={true}
              className="px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center w-full pr-2">
                <div className="flex items-center space-x-3 w-[90%] ">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage
                      alt={ClientName || ClientId}
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {(ClientName || ClientId)
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="">
                    <p className="font-medium text-gray-900 text-[17px] truncate w-full pr-6 ">
                      {trimString(ClientName || ClientId, DynamicWidth)}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span className="flex items-center gap-1">
                        {callTypeIcon}
                        <span>{formattedStartTime}</span>
                      </span>
                      <span className="inline-flex items-center">
                        <span className="h-1 w-1 rounded-full bg-gray-400 mx-1"></span>
                        <span>
                          {formatDuration(row.original.Duration, {
                            showHours: false,
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {(isClickToCallAllowed || isAMICallAllowed) && (
                  <div className="flex items-center border rounded-full">
                    <HandleCall
                      className="w-[18px] h-[18px]"
                      call={row.original}
                    />
                  </div>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="bg-gray-50/50">
              <div className="px-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="text-gray-500">Client ID</div>
                  <div className="font-medium text-right">{ClientId}</div>

                  {isPhoneNumberAllowed && (
                    <>
                      <div className="text-gray-500">Phone number</div>
                      <div className="font-medium text-right flex items-center justify-end gap-1">
                        {ClientNumber}
                      </div>
                    </>
                  )}

                  <div className="text-gray-500">Client Branch</div>
                  <div className="font-medium text-right">{BranchName}</div>
                </div>

                <Separator className="my-3" />

                {Number(row.original.CallStatus) === CallStatusState.HANGUP && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Headphones className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Call Recording</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isViewRecordingAllowed && (
                        <PlayAudio row={row.original} />
                      )}
                      {isRecordingDownloadAllowed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => downloadAudio(RecordingName)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <Separator className="my-3" />

                <div className="flex justify-between items-center  rounded-md ">
                  {/* Label */}
                  <div className="flex items-center gap-2">
                    <img className="w-5" src={FollowUp} alt="" />
                    <span className="text-gray-700">Follow Ups</span>
                  </div>

                  {/* Actions */}
                  {isFollowupTaskAllowed && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-1 text-orange-600 hover:text-orange-700"
                        onClick={() => handleCreateFollowUp(row)}
                      >
                        <EditIcon className="h-3 w-3 mr-1 text-orange-500" />
                        <span>Create</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-1 text-orange-600 hover:text-orange-700"
                        onClick={() => handleViewFollowUpDialog(row)}
                      >
                        <EyeIcon className="h-3 w-3 mr-1 text-orange-500" />
                        <span>View</span>
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-3" />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700">Remarks</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary hover:text-primary/80"
                      onClick={() => handleEdit(row.original)}
                    >
                      <EditIcon className="h-3 w-3 mr-1" />
                      <span>Edit Details</span>
                    </Button>
                  </div>
                  <p
                    className={`text-gray-600 bg-white p-3 ${
                      Remarks === "" && "hidden"
                    } rounded-md border border-gray-100`}
                  >
                    {Remarks || "No remarks available."}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
];
