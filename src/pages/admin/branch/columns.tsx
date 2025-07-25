import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  DataMobileTableRowActions,
  DataTableRowActions,
} from "@/components/ui/data-table/data-table-row-actions";
import { useBranchModal } from "@/hooks/useBranchModal";
import { Branch } from "@/schemas/branch";
import { usePrivilege } from "@/contexts/PrivilegeContext";

export const desktopColumns: ColumnDef<Branch>[] = [
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const { onOpen, setData } = useBranchModal();
  //     const { isBranchUpdateAllowed } = usePrivilege();

  //     return (
  //       <DataTableRowActions
  //         row={row}
  //         onOpen={onOpen}
  //         setData={setData}
  //         allowDelete={false}
  //         allowEdit={isBranchUpdateAllowed}
  //         allowPasswordReset={false}
  //       />
  //     );
  //   },
  // },
  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start item bg-center" column={column} title="Branch Name" />
    ),
    enableResizing: true,
    size: 60,
    minSize: 30,
    maxSize: 100,
    cell: ({ row }) => (
      <div className={`${row.original.IsDeleted === 1 ? "text-red-600" : ""}`}>
        <span className="p-4 max-w-[500px] truncat">
        {row.getValue("BranchName")}
        </span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "BranchAddress",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start item-center" column={column} title="Branch Address" />
    ),
    enableResizing: true,
    size: 60,
    minSize: 30,
    maxSize: 100,
    cell: ({ row }) =>
       <div>
        <span className="p-4 max-w-[500px] truncate">
          {row.getValue("BranchAddress")}
          </span>
        </div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "BranchCategory",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start item bg-center" column={column} title="Branch Category" />
    ),
    enableResizing: true,
    size: 60,
    minSize: 30,
    maxSize: 100,
    cell: ({ row }) => (
      <div>
        <span className="p-4 max-w-[500px] truncate">
        {row.getValue("BranchCategory") == 1 ? "Branch" : "Franchisee"}
        </span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "UpdatedBy",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start item bg-center" column={column} title="Updated By" />
    ),
    enableResizing: true,
    size: 60,
    minSize: 30,
    maxSize: 100,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.getValue("UpdatedBy")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "LastUpdateTime",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start item bg-center" column={column} title="Last Updated Time" />
    ),
    enableResizing: true,
    size: 60,
    minSize: 30,
    maxSize: 100,
    cell: ({ row }) => {
      const formattedTime = format(
        new Date(Number(row.original.LastUpdateDate) * 1000),
        "PPpp"
      );

      return (
        <div className="flex justify-start items-center space-x-2">
          <span className="p-4 max-w-[500px] truncate">{formattedTime}</span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<Branch>[] = [
  {
    id: "branch",
    // accessorKey: 'BranchName',
    // header: ({ column }) => (
    //   <DataTableColumnHeader column={column} title="Branch Name" />
    // ),
    cell: ({ row }) => {
      const {
        BranchName,
        BranchAddress,
        BranchCategory,
        UpdatedBy,
        LastUpdateDate,
      } = row.original;
      const { onOpen, setData } = useBranchModal();
      const { isBranchUpdateAllowed } = usePrivilege();

      const formattedTime = format(
        new Date(Number(LastUpdateDate) * 1000),
        "PPpp"
      );

      return (
        <Accordion type="single" collapsible className="w-full p-0">
          <AccordionItem className="p-0" value="item-1">
            <AccordionTrigger className="p-0 px-2">
              <li
                key={BranchName}
                className="flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
              >
                <div className="flex justify-between items-center space-x-4 w-full">
                  <div className="flex justify-center items-center gap-2 w-full mr-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {BranchName}
                      </p>
                    </div>

                    {row.original.IsDeleted == 1 && (
                      <Badge className="text-xs" variant="destructive">
                        Deleted
                      </Badge>
                    )}

                    <DataMobileTableRowActions
                      row={row}
                      onOpen={onOpen}
                      setData={setData}
                      allowDelete={false}
                      allowEdit={isBranchUpdateAllowed}
                      allowPasswordReset={false}
                    />
                  </div>
                </div>
              </li>
            </AccordionTrigger>
            <AccordionContent className="mx-4 m-4 rounded-lg border text-gray-700 border-gray-300 p-4 space-y-1 text-xs">
              <div className="flex justify-between items-center rounded-lg">
                <span>Branch</span>
                <span>{BranchName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Address</span>
                <span>{BranchAddress ? BranchAddress : "NA"}</span>
              </div>

              <div className="flex justify-between items-center rounded-lg">
                <span>Category</span>
                <span>{BranchCategory == 1 ? "Branch" : "Franchisee"}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Updated By</span>
                <span>{UpdatedBy}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Last Updated Time</span>
                <span>{formattedTime}</span>
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
