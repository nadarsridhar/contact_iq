import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserActivityReportSchema } from "@/schemas/reports/user-activity";
import globalState from "@/utils/globalState";
import { trimString } from "@/lib/utils";
import { getUserCategoryName } from "@/utils/userCategory";

export const desktopColumns: ColumnDef<UserActivityReportSchema>[] = [
  {
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`${globalState.AGENT_NAME}`}
      />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.LoggedIn == 1 && (
          <div className={`rounded-full h-2 w-2 bg-green-500`}></div>
        )}
        {row.original.UserId}
      </div>
    ),
  },
  {
    accessorKey: "UserName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={`${globalState.AGENT_NAME} Name`}
      />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => <div>{trimString(row.original.UserName, 30)}</div>,
  },
  {
    accessorKey: "UserCategory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Category" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          {getUserCategoryName(row.original.UserCategory)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate font-medium">
          {row.original.BranchName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "LoggedInTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Logged In Time" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      let formattedLoggedInTime = "";
      if (row.original.LoggedInApp) {
        formattedLoggedInTime = format(
          new Date(Number(row.original.LoggedInTime) * 1000),
          "PPpp"
        );
      }

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formattedLoggedInTime}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "LoggedOutTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Logged Out Time" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      let formattedLoggedOutTime = "";
      if (row.original.LoggedOutTime) {
        formattedLoggedOutTime = format(
          new Date(Number(row.original.LoggedOutTime) * 1000),
          "PPpp"
        );
      }

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formattedLoggedOutTime}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "LoggedInApp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Logged In Device" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const [browser, version] = row.original.LoggedInApp?.split(", ");

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {browser} {version ? `v${version}` : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "LoggedInApp2",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Logged In OS" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const [, , os, version] = row.original.LoggedInApp?.split(", ");

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{os}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "LoggedInAddress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Logged In IP" />
    ),
    enableResizing: true,
    size: 90,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.original.LoggedInAddress}
          </span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<UserActivityReportSchema>[] = [
  {
    id: "call-traffic-report",
    cell: ({ row }) => {
      const {
        UserName,
        UserId,
        BranchName,
        LoggedInAddress,
        LoggedInApp,
        LoggedInTime,
        LoggedOutTime,
        UserCategory,
      } = row.original;

      let formattedLoggedOutTime = "";
      let formattedLoggedInTime = "";
      const [browser, browserVersion, os, osVersion] = LoggedInApp?.split(", ");

      if (LoggedInApp) {
        formattedLoggedInTime = format(
          new Date(Number(LoggedInTime) * 1000),
          "PPpp"
        );
      }
      if (LoggedOutTime) {
        formattedLoggedOutTime = format(
          new Date(Number(LoggedOutTime) * 1000),
          "PPpp"
        );
      }

      return (
        <Accordion type="single" collapsible className="w-full p-0">
          <AccordionItem className="p-0" value="item-1">
            <AccordionTrigger className="p-0 px-2">
              <li
                key={UserId}
                className="flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
              >
                <div className="flex justify-between items-center space-x-4 w-full">
                  <div className="flex justify-center items-center gap-2 w-full mr-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {UserId} {UserName ? "-" : ""} {UserName}
                      </p>
                    </div>
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
                <span>User Category</span>
                <span>{getUserCategoryName(UserCategory)}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Browser</span>
                <span>
                  {browser} {browserVersion ? `v${browserVersion}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>OS</span>
                <span>{os}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Last Logged In Time</span>
                <span>{formattedLoggedInTime}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Last Logged Out Time</span>
                <span>{formattedLoggedOutTime}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Last Logged In IP</span>
                <span>{LoggedInAddress}</span>
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
