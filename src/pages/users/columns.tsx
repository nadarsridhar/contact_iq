import { ColumnDef } from "@tanstack/react-table";

import { UserMaster } from "@/schemas/userMaster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HandleCall from "@/components/HandleCall";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import globalState from "@/utils/globalState";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export const desktopColumns: ColumnDef<UserMaster>[] = [
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
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-8"
        column={column}
        title={`${globalState.AGENT_NAME} ID`}
      />
    ),
    cell: ({ row }) => {
      const UserId: string = row.original.UserId;

      return (
        <div className="flex items-center ml-8">
          {UserId && (
            <Avatar className="h-9 w-9">
              <AvatarImage alt={UserId} className="rounded-full" />
              <AvatarFallback className="border-2  bg-primary text-blue-100">
                {UserId.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="ml-2">{UserId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserName",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="ml-8"
        column={column}
        title="Username"
      />
    ),
    cell: ({ row }) => {
      const UserName: string = row.getValue("UserName");

      return (
        <div className="flex items-center ml-8">
          {UserName && (
            <Avatar className="h-9 w-9">
              <AvatarImage alt={UserName} className="rounded-full" />
              <AvatarFallback className="border-2  bg-primary text-blue-100">
                {UserName.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="ml-2">{UserName}</span>
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
          <span className="ml-2">{row.original.BranchName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserMobileNumber",
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
          <span className="ml-2">{row.original.UserMobileNumber}</span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<UserMaster>[] = [
  {
    accessorKey: "call",
    // enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader className="ml-8" column={column} title="Sort" />
    ),
    cell: ({ row }) => {
      const { UserId, UserName, BranchName } = row.original;
      const { isClickToCallAllowed, isAMICallAllowed } = usePrivilege();

      return (
        <div className="flex justify-between items-center px-4">
          <div>
            <h2 className="text-base mb-1 font-semibold">{UserName}</h2>
            <div className="flex flex-col text-xs font-semibold text-gray-500">
              <div>
                <span>Client ID: </span>
                <span>{UserId}</span>
              </div>
              <div>
                <span>Branch: </span>
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
