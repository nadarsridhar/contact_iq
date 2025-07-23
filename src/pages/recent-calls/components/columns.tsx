import { ColumnDef } from "@tanstack/react-table";

import { Call } from "../../../schemas/call";
import { DataTableColumnHeader } from "../../clients/components/data-table-column-header";
import { DataTableRowActions } from "../../clients/components/data-table-row-actions";
import {
  EarthIcon,
  PhoneIcon,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Smartphone,
} from "lucide-react";
import { CallStatusState, CallType, getCallStatus } from "@/utils/callStatus";
import PlayAudio from "@/components/PlayAudio";
import HandleCall from "@/components/HandleCall";
import { Badge } from "@/components/ui/badge";
import { convertDateTime } from "@/utils/dateHelpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export const getCallIcon = (
  callStatus: CallStatusState,
  callType: CallType,
  textColor: string,
  className?: string
) => {
  callType = Number(callType);
  if (callType == 1 && callStatus == CallStatusState.UNANSWERED) {
    return <PhoneMissed className={`h-4 w-4 ${textColor} ${className}`} />;
  } else if (callType == 1) {
    return <PhoneIncoming className={`h-4 w-4 ${textColor} ${className}`} />;
  } else if (callType == 2) {
    return <PhoneOutgoing className={`h-4 w-4 ${textColor} ${className}`} />;
  }
};

const columns: ColumnDef<Call>[] = [
  {
    accessorKey: "call-status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const callStatus = getCallStatus(
        row.original.CallStatus,
        row.original.CallType
      );
      let callTypeIcon = getCallIcon(
        row.original.CallStatus,
        row.original.CallType,
        callStatus.textColor
      );

      const isOngoingCall =
        row.index === 0 &&
        (row.original.CallStatus == CallStatusState.INCOMING ||
          row.original.CallStatus == CallStatusState.ANSWERED);
      if (isOngoingCall) {
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
        <div
          className={`flex items-center ${
            isOngoingCall ? "animate-pulse" : ""
          }`}
        >
          {row.original.WebRTCCall === 1 ? (
            <EarthIcon className="text-primary w-4 mr-2" />
          ) : (
            <Smartphone className="invisible" />
          )}
          <Badge
            variant="secondary"
            className={`flex items-center space-x-1 ${callStatus.bgColor}`}
          >
            <span>{callTypeIcon}</span>
            <span>{callStatus.statusText}</span>
          </Badge>
        </div>
      );
    },
  },
  {
    id: "call-actions",
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="Click to call" />
    // ),
    cell: ({ row }) => {
      const { isClickToCallAllowed, isAMICallAllowed } = usePrivilege();
      if (!isClickToCallAllowed && !isAMICallAllowed) return null;

      return (
        <div className="flex">
          <HandleCall call={row.original} />
        </div>
      );
    },
  },
  {
    accessorKey: "ClientId",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-14"
        column={column}
        title="Client ID"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center ml-14">
          <span className="ml-2">{row.getValue("ClientId")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientName",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-14"
        column={column}
        title="Client Name"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center ml-14">
          <span className="ml-2">{row.getValue("ClientName")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex ml-5">
          <span className="font-medium">{row.getValue("ClientNumber")}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'Duration',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Duration" />
  //   ),
  //   cell: ({ row }) => {
  //     // const startTime = Number(row.original.starttime);
  //     // const endTime = Number(row.original.endtime);
  //     // const durationEpoch = endTime - startTime;
  //     // let duration = formatDuration(durationEpoch);

  //     // if (startTime <= 0 || endTime <= 0) {
  //     //   duration = '0:00';
  //     // }

  //     const duration = row.original.Duration;

  //     return (
  //       <div className="flex space-x-2">
  //         <span className="max-w-[500px] truncate font-medium">{duration}</span>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "StartTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Call Time" />
    ),
    cell: ({ row }) => {
      if (Number(row.getValue("StartTime")) <= 0) return null;
      const formattedStartTime = convertDateTime(row.getValue("StartTime"));

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formattedStartTime}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Remarks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Remarks" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("Remarks")}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { isViewRecordingAllowed } = usePrivilege();

      return (
        <div className="flex justify-end items-center">
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

          <DataTableRowActions row={row} />
        </div>
      );
    },
  },
];

export default columns;
