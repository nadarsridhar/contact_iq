import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { CallTrafficReportSchema } from "@/schemas/reports/call-traffic";
import { formatDuration } from "@/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CallTrafficClientDetailsReportSchema } from "@/schemas/reports/call-traffic/client-details";

export const desktopColumns: ColumnDef<CallTrafficClientDetailsReportSchema>[] =
  [
    {
      accessorKey: "ClientId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client ID" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => (
        <div className="w-[80px]">{row.original.ClientId}</div>
      ),
      enableSorting: false,
      enableHiding: false,
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
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.ClientName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "IncomingCalls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Incoming Calls" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.IncomingCalls}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "CompletedCalls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Completed Calls" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.CompletedCalls}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "MissedCalls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Missed Calls" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.MissedCalls}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "UnansweredCalls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unanswered Calls" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.UnansweredCalls}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "OutgoingCalls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Outgoing Calls" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.OutgoingCalls}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "TotalCalls",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Calls" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.original.TotalCalls}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "TotalCallDuration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Duration" />
      ),
      enableResizing: true,  
      size: 80,                
      minSize: 30,               
      maxSize: 300,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {formatDuration(row.original.TotalCallDuration)}
            </span>
          </div>
        );
      },
    },
  ];

export const mobileColumns: ColumnDef<CallTrafficClientDetailsReportSchema>[] =
  [
    {
      id: "call-traffic-report",
      cell: ({ row }) => {
        const {
          ClientName,
          ClientId,
          IncomingCalls,
          MissedCalls,
          OutgoingCalls,
          TotalCalls,
          CompletedCalls,
          UnansweredCalls,
        } = row.original;

        return (
          <Accordion type="single" collapsible className="w-full p-0">
            <AccordionItem className="p-0" value="item-1">
              <AccordionTrigger className="p-0 px-2">
                <li
                  key={ClientId}
                  className="flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
                >
                  <div className="flex justify-between items-center space-x-4 w-full">
                    <div className="flex justify-center items-center gap-2 w-full mr-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {ClientId} {ClientName ? "-" : ""} {ClientName}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </AccordionTrigger>
              <AccordionContent className="mx-4 m-4 rounded-lg border text-gray-950 border-gray-300 p-4 space-y-1 text-xs">
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Incoming Calls</span>
                  <span>{IncomingCalls ? IncomingCalls : 0}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Outgoing Calls</span>
                  <span>{OutgoingCalls ? OutgoingCalls : 0}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Completed Calls</span>
                  <span>{CompletedCalls ? CompletedCalls : 0}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Missed Calls</span>
                  <span>{MissedCalls ? MissedCalls : 0}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Unanswered Calls</span>
                  <span>{UnansweredCalls ? UnansweredCalls : 0}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Total Calls</span>
                  <span>{TotalCalls ? TotalCalls : 0}</span>
                </div>
                <div className="flex justify-between items-center rounded-lg">
                  <span className="font-semibold">Average Duration</span>
                  <span>
                    {formatDuration(
                      row.original.TotalCallDuration / row.original.TotalCalls
                    )}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
