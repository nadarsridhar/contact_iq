import { ColumnDef } from "@tanstack/react-table";

import { Call } from "../../../schemas/call";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HandleCall from "@/components/HandleCall";
import { ClientMaster } from "@/schemas/clients";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export const desktopColumns: ColumnDef<ClientMaster>[] = [
  {
    accessorKey: "call",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      const { isClickToCallAllowed, isAMICallAllowed } = usePrivilege();
      if (!isClickToCallAllowed && !isAMICallAllowed) return null;

      return <HandleCall call={row.original} />;
    },
  },
  {
    accessorKey: "ClientId",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-8"
        column={column}
        title="Client ID"
      />
    ),
    cell: ({ row }) => {
      const clientId: string = row.getValue("ClientId");

      return (
        <div className="flex items-center ml-8">
          {clientId && (
            <Avatar className="h-9 w-9">
              <AvatarImage alt={clientId} className="rounded-full" />
              <AvatarFallback className="border-2  bg-primary text-blue-100">
                {clientId
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="ml-2">{clientId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientName",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-8"
        column={column}
        title="Client Name"
      />
    ),
    cell: ({ row }) => {
      const clientName: string = row.getValue("ClientName");

      return (
        <div className="flex items-center ml-8">
          {clientName && (
            <Avatar className="h-9 w-9">
              <AvatarImage alt={clientName} className="rounded-full" />
              <AvatarFallback className="border-2  bg-primary text-blue-100">
                {clientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="ml-2"> {clientName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader className="ml-8" column={column} title="Branch" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center ml-8">
          <span className="ml-2">{row.getValue("BranchName")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientNumber",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-8"
        column={column}
        title="Phone Number"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center ml-8">
          <span className="ml-2">{row.getValue("ClientNumber")}</span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<ClientMaster>[] = [
  {
    accessorKey: "call",
    // enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader className="ml-8" column={column} title="Sort" />
    ),
    cell: ({ row }) => {
      const { ClientId, ClientName, BranchName } = row.original;
      const { isClickToCallAllowed, isAMICallAllowed } = usePrivilege();

      return (
        <div className=" flex justify-between items-center px-4">
          <div>
            <h2 className="text-base mb-1 font-semibold">{ClientName}</h2>
            <div className="flex flex-col text-xs font-semibold text-gray-500">
              <div>
                <span>Client ID: </span>
                <span>{ClientId}</span>
              </div>
              <div>
                <span>Branch:  </span>
                <span>{BranchName}</span>
              </div>
            </div>
          </div>
          {(isClickToCallAllowed || isAMICallAllowed) && (
            <div className="rounded-full border-2 border-green-500">
              <HandleCall
                className="text-green-500 h-5 w-5"
                call={row.original}
              />
            </div>
          )}
        </div>
      );
    },
  },
];
