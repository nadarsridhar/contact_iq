import { ColumnDef } from "@tanstack/react-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
  DataMobileTableRowActions,
  DataTableRowActions,
} from "@/components/ui/data-table/data-table-row-actions";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import { getUserCategoryName } from "@/utils/userCategory";
import { UserMaster } from "@/schemas/userMaster";
import { cn, trimString } from "@/lib/utils";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { hasPrivilege, LOGIN_MODE } from "@/utils/privileges";
import { useEffect } from "react";

export const desktopColumns: ColumnDef<UserMaster>[] = [
  {
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableResizing: true,
    size: 80,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
          <div className="p-2 flex justify-start items-center">
          <div className="w-4 flex justify-start">
            {row.original.LoggedIn == 1 && (
              <span className="rounded-full h-2 w-2 bg-green-500"></span>
            )}
          </div>
          <span
            className={`ml-1 max-w-[500px] truncate  ${
              row.original.IsDeleted === 1 ? "text-red-500" : ""
            }`}
          >
            {row.getValue("UserId")}
          </span>
        </div>

      );
    },
  },
  {
    accessorKey: "UserName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {trimString(row.getValue("UserName"), 15)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserCategory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const UserCategory = getUserCategoryName(row.getValue("UserCategory"));

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {UserCategory}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserMobileNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mobile Number" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.getValue("UserMobileNumber")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.getValue("BranchName")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "MappingTemplateId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mapped Template" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.getValue("MappingTemplateId")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "PrivilegeTemplateId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Privilege Template" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.getValue("PrivilegeTemplateId")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "WebRTCFlag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Call Type" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.original.WebRTCFlag == 1 ? "Internet Call" : "Normal Call"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ActiveFlag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.original.ActiveFlag == 1 ? "Yes" : "No"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserEmailId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.getValue("UserEmailId")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "LoginMode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Login Type" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate p-4">
            {row.original.LoginMode === 2 ? "SAML" : "Traditional Login"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "UpdatedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated By" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
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
      <DataTableColumnHeader column={column} title="Last updated time" />
    ),
    enableResizing: true,
    size: 100,
    minSize: 30,
    maxSize: 300,
    cell: ({ row }) => {
      const formattedTime = format(
        new Date(Number(row.original.LastUpdateDate) * 1000),
        "PPpp"
      );

      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">{formattedTime}</span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<UserMaster>[] = [
  {
    id: "UserId",
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ row }) => {
      const {
        UserId,
        UserName,
        UserMobileNumber,
        UserEmailId,
        CompanyName,
        UserCategory,
        BranchName,
        MappingTemplateId,
        IsDeleted,
        PrivilegeTemplateId,
        LoggedIn,
        UpdatedBy,
        LastUpdateDate,
        LoginMode,
      } = row.original;

      const UserCategoryName = getUserCategoryName(Number(UserCategory));

      const AUTH_MODE = window.APP_CONFIG.L_MODE;
      const isSAMLLoginEnabled = hasPrivilege(AUTH_MODE, LOGIN_MODE.SAML);

      const { onOpen, setData } = useUserMasterModal();
      const {
        isUserUpdateAllowed,
        isUserDeleteAllowed,
        isResetPassordAllowed,
      } = usePrivilege();

      const formattedTime = format(
        new Date(Number(LastUpdateDate) * 1000),
        "PPpp"
      );

      return (
        <Accordion type="single" collapsible className="w-full p-0">
          <AccordionItem className="p-0" value="item-1">
            <AccordionTrigger className="p-0 px-2">
              <li
                key={UserId}
                className="flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
              >
                <div className="flex justify-between items-center space-x-4 w-full mr-4">
                  <div className="flex items-center justify-between w-full gap-2 hover:bg-gray-100">
                    {LoggedIn == 1 && (
                      <div
                        className={`rounded-full h-2 w-2 bg-green-500`}
                      ></div>
                    )}
                    <div className={`flex-1 min-w-0`}>
                      <p
                        className={cn(
                          `${
                            IsDeleted == 1 ? "text-red-500" : "text-gray-900"
                          }`,
                          `font-semibold truncate`
                        )}
                      >
                        {UserId} - {UserName}
                      </p>
                    </div>

                    <DataMobileTableRowActions
                      row={row}
                      onOpen={onOpen}
                      setData={setData}
                      allowDelete={isUserDeleteAllowed}
                      allowEdit={isUserUpdateAllowed}
                      allowPasswordReset={isResetPassordAllowed}
                    />
                  </div>
                </div>
              </li>
            </AccordionTrigger>
            <AccordionContent className="mx-4 m-4 rounded-lg border text-gray-950 border-gray-300 p-4 space-y-1 text-xs">
              <div className="flex justify-between items-center rounded-lg font-semibold">
                <span>ID</span>
                <span>{UserId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Name</span>
                <span>{UserName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Category</span>
                <span>{UserCategoryName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Mobile Number</span>
                <span>{UserMobileNumber}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">CompanyName</span>
                <span>{CompanyName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Call Type</span>
                <span>
                  {row.original.WebRTCFlag == 1
                    ? "Internet Call"
                    : "Normal Call"}
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Login Mode</span>
                <span>
                  {row.original.LoginMode == 2 ? "SAML" : "Traditional Login"}
                </span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Active</span>
                <span>{row.original.ActiveFlag == 1 ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Email</span>
                <span>{UserEmailId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Branch</span>
                <span>{BranchName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Mapped Template</span>
                <span>{MappingTemplateId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Privilege Template</span>
                <span>{PrivilegeTemplateId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Updated By</span>
                <span>{UpdatedBy}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span className="font-semibold">Last Updated Time</span>
                <span>{formattedTime}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
];
