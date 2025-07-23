import { ColumnDef } from "@tanstack/react-table";

import { UserMaster } from "@/schemas/userMaster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HandleCall from "@/components/HandleCall";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import globalState from "@/utils/globalState";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { getTaskStatusName } from "@/utils/followup";
import { format } from "date-fns";
import { TaskStatus as TaskStatusUpdate } from "@/utils/followup";
import ClockIcon from '../../../../public/SVGs/ClockIcon.svg'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCreateFollowup } from "@/hooks/useCreateFollowup";
import { ACTIONS } from "@/utils/actions";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";

export const desktopColumns: ColumnDef<UserMaster>[] = [
  {
    accessorKey: "TaskStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">
            {getTaskStatusName(row.original.TaskStatus)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.ClientId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.ClientName}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "Title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="About" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.Title}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "FollowUpTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Followup Time" />
    ),
    cell: ({ row }) => {
      let formattedTime = "";
      if (row.original.FollowUpTime) {
        formattedTime = format(
          new Date(Number(row.original.FollowUpTime) * 1000),
          "PPpp"
        );
      }

      return (
        <div className="flex items-center">
          <span className="ml-2">{formattedTime}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "AttendedId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Completed by" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.AttendedId}</span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<UserMaster>[] = [
  {
    accessorKey: "call",
    header: () => (
      <div className="flex items-center justify-center py-3 bg-white border-b border-gray-100">
        <span className="text-base font-semibold text-gray-800 tracking-tight">
          Followup Summary
        </span>
      </div>
    ),
    cell: ({ row }) => {
      const {
        TaskStatus,
        ClientId,
        ClientName,
        Title,
        FollowUpTime,
        AttendedId,
      } = row.original;

      const {
        onOpen: openCreateFollowupDialog,
        setData: setModifyFollowupTask,
        triggerApiRefresh,
      } = useCreateFollowup();

      const {        
        isFollowupTaskAllowed,
      } = usePrivilege();

      function handleFollowUpUpdate(row, status) {
        openCreateFollowupDialog();
        setModifyFollowupTask({
          ...row.original,
          OperationCode: ACTIONS.UPDATE,
          Status: status,
        });
      }

      let formattedTime = "";
      if (FollowUpTime) {
        try {
          formattedTime = format(
            new Date(Number(FollowUpTime) * 1000),
            "PPpp"
          );
        } catch {
          formattedTime = "-";
        }
      }

      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`item-${ClientId || Title}`}>
            <AccordionTrigger className="p-0">
              <div className="flex items-center justify-between w-full px-3 py-2 bg-white rounded-md border border-gray-100 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-500 font-semibold text-lg">
                    {ClientName ? ClientName.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    {/* <span
                      className="font-medium text-gray-900 truncate"
                      title={Title || "No Title"}
                    >
                      {Title || <span className="italic text-gray-400">No Title</span>}
                    </span> */}
                    <span
                      className="font-medium text-gray-900 truncate"
                      title={ClientName || "No Client"}
                    >
                      {ClientName || <span className="italic text-gray-300">No Client</span>}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[90px]">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${getTaskStatusName(TaskStatus) === "Completed" ? 'text-green-700' :getTaskStatusName(TaskStatus) === 'Cancelled' ?  'text-red-500'  :'text-yellow-700'}`}
                  >
                    {getTaskStatusName(TaskStatus)}
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${getTaskStatusName(TaskStatus) === "Completed" ? 'bg-green-50' :getTaskStatusName(TaskStatus) === 'Cancelled' ?  'bg-red-50'  :'bg-yellow-50'}`}>
                    <img className="w-4" src={ClockIcon} alt="" />
                    <span
                      className={`text-xs ${getTaskStatusName(TaskStatus) === "Completed" ? 'text-green-700' :getTaskStatusName(TaskStatus) === 'Cancelled' ?  'text-red-500'  :'text-yellow-700'} font-semibold`}
                      title={formattedTime || "No Time"}
                    >
                      {formattedTime ? formattedTime : <span className="italic text-yellow-400">No Time</span>}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-b-md text-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="w-28 text-gray-500">Client ID:</span>
                  <span className="ml-1 text-gray-900">{ClientId || <span className="italic text-gray-400">-</span>}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-28 text-gray-500">Completed By:</span>
                  <span className="ml-1 text-gray-900">{AttendedId || <span className="italic text-gray-400">-</span>}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-28 text-gray-500">Followup Time:</span>
                  <span className="ml-1 text-gray-900">{formattedTime || <span className="italic text-gray-400">-</span>}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-28 text-gray-500">Task Status:</span>
                  <span className={`ml-1 ${getTaskStatusName(TaskStatus) === "Completed" ? 'text-green-700' :getTaskStatusName(TaskStatus) === 'Cancelled' ?  'text-red-500'  :'text-yellow-700'}`}>{getTaskStatusName(TaskStatus)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-28 text-gray-500">Client Name:</span>
                  <span className="ml-1 text-gray-900">{ClientName || <span className="italic text-gray-400">-</span>}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-28 text-gray-500">Title:</span>
                  <span className="ml-1 text-gray-900">{Title || <span className="italic text-gray-400">-</span>}</span>
                </div>
              </div>
              <Separator className="my-3" />

              <div className="flex justify-end items-center  px-3 rounded-md ">
                {/* Label */}
               
                {isFollowupTaskAllowed && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-1 text-orange-600 hover:text-orange-700"
                      onClick={() => handleFollowUpUpdate(row, TaskStatusUpdate.Todo)}
                    >
                      <EditIcon className="h-3 w-3 mr-1 text-orange-500" />
                      <span>Modify</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-1 text-orange-600 hover:text-orange-700"
                      onClick={() => handleFollowUpUpdate(row, TaskStatusUpdate.Cancelled)}
                    >
                      <EditIcon className="h-3 w-3 mr-1 text-orange-500" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>


              <Separator className="my-3" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
];
