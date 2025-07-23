import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { UserMaster } from "@/schemas/userMaster";
import globalState from "@/utils/globalState";

export const columns: ColumnDef<UserMaster>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'Id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="ID" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="w-[80px]">{row.getValue('BranchId')}</div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  {
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`${globalState.AGENT_NAME} ID`}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("UserId")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`${globalState.AGENT_NAME} Name`}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("UserName")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={`Branch`} />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("BranchName")}
          </span>
        </div>
      );
    },
  },
];
