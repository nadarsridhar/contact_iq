import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
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
import { useClientModal } from "@/hooks/useClientModal";
import { ClientMaster } from "@/schemas/clients";
import HandleCall from "@/components/HandleCall";
import { cn, trimString } from "@/lib/utils";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useAuth } from "@/contexts/AuthContext";

export const desktopColumns: ColumnDef<ClientMaster>[] = [
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const { onOpen, setData } = useClientModal();
  //     const { isClientUpdateAllowed, isClientDeleteAllowed } = usePrivilege();

  //     return (
  //       <DataTableRowActions
  //         row={row}
  //         onOpen={onOpen}
  //         setData={setData}
  //         allowEdit={isClientUpdateAllowed}
  //         allowDelete={isClientDeleteAllowed}
  //       />
  //     );
  //   },
  // },
  {
    id: "call-actions",
    enableResizing: true,  
    size: 30,                
    minSize: 30,              
    maxSize: 300,
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
      <DataTableColumnHeader className="flex justify-start items-center" column={column} title="ID" />
    ),
    enableResizing: true,  
    size: 60,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start items-center space-x-2">
          <span
            className={`p-4 max-w-[500px] truncate   ${
              row.original.IsDeleted === 1 ? "text-red-500" : ""
            }`}
          >
            {row.getValue("ClientId")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientName",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start items-center" column={column} title="Name" />
    ),
    enableResizing: true,  
    size: 100,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.getValue("ClientName")}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "BranchName",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start items-center" column={column} title="Branch" />
    ),
    enableResizing: true,  
    size: 100,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.getValue("BranchName")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "PreferedAgentId1",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start items-center"
        column={column}
        title="Pref. Agent 1"
        allowTooltip
        tooltipText="Preferred Agent 1"
      />
    ),
    enableResizing: true,  
    size: 100,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.getValue("PreferedAgentId1")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "PreferedAgentId2",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start items-center"
        column={column}
        title="Pref. Agent 2"
        allowTooltip
        tooltipText="Preferred Agent 2"
      />
    ),
    enableResizing: true,  
    size: 100,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.getValue("PreferedAgentId2")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "PreferedAgentId3",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start items-center"
        column={column}
        title="Pref. Agent 3"
        allowTooltip
        tooltipText="Preferred Agent 3"
      />
    ),
    enableResizing: true,  
    size: 100,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.getValue("PreferedAgentId3")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ActiveFlag",
    header: ({ column }) => (
      <DataTableColumnHeader className="flex justify-start items-center" column={column} title="Active" />
    ),
    enableResizing: true,  
    size: 30,                
    minSize: 30,               
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="p-4 max-w-[500px] truncate">
            {row.original.ActiveFlag == 1 ? "Yes" : "No"}
          </span>
        </div>
      );
    },
  },
];

export const mobileColumns: ColumnDef<ClientMaster>[] = [
  {
    id: "ClientId",
    cell: ({ row }) => {
      const {
        ClientId,
        ClientName,
        ClientNumber,
        ClientEmailId,
        Tpin,
        BranchName,
        PreferedAgentId1,
        PreferedAgentId2,
        PreferedAgentId3,
        MappingTemplateId,
        IsDeleted,
        LastUpdateDate,
        UpdatedBy,
      } = row.original;

      const formattedTime = format(
        new Date(Number(LastUpdateDate) * 1000),
        "PPpp"
      );

      const { onOpen, setData } = useClientModal();
      const {
        isClickToCallAllowed,
        isClientUpdateAllowed,
        isClientDeleteAllowed,
        isPhoneNumberAllowed,
        isClientCreateAllowed,
        isAMICallAllowed,
      } = usePrivilege();

      const { DynamicWidth } = useAuth();

      return (
        <Accordion type="single" collapsible className="w-full p-0">
          <AccordionItem className="p-0" value="item-1">
            <AccordionTrigger className="w-full pr-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 rounded-md">
              <li
                key={ClientId}
                className="flex w-full transition-colors duration-200 ease-in-out rounded-md"
              >
                <div className="flex items-center justify-between w-full py-1 px-1">
                  <div className="flex items-center min-w-0 gap-2 flex-1">
                    {(isClickToCallAllowed || isAMICallAllowed) && (
                      <div className="flex-shrink-0 border rounded-full p-0.5">
                        <HandleCall
                          className="w-[18px] h-[18px]"
                          call={row.original}
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "font-semibold truncate text-[17px]",
                          IsDeleted == 1 ? "text-red-500" : "text-gray-900"
                        )}
                      >
                        <span>{ClientId}</span>
                        <span className="mx-1">-</span>
                        <span>{trimString(ClientName, DynamicWidth)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <DataMobileTableRowActions
                      row={row}
                      onOpen={onOpen}
                      setData={setData}
                      allowEdit={isClientUpdateAllowed}
                      allowDelete={isClientDeleteAllowed}
                      allowPasswordReset={false}
                    />
                  </div>
                </div>
              </li>
            </AccordionTrigger>
            <AccordionContent className="mx-4 m-4 rounded-lg border text-gray-700 border-gray-300 p-4 space-y-1 text-xs">
              <div className="flex justify-between items-center rounded-lg">
                <span>ID</span>
                <span>{ClientId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Name</span>
                <span>{trimString(ClientName, 15)}</span>
              </div>
              {isPhoneNumberAllowed && (
                <div className="flex justify-between items-center rounded-lg">
                  <span>Mobile Number</span>
                  <span>{ClientNumber}</span>
                </div>
              )}
              {isClientCreateAllowed && (
                <div className="flex justify-between items-center rounded-lg">
                  <span>Email</span>
                  <span>{ClientEmailId}</span>
                </div>
              )}
              {isClientCreateAllowed && (
                <div className="flex justify-between items-center rounded-lg">
                  <span>Tpin</span>
                  <span>{Tpin}</span>
                </div>
              )}
              <div className="flex justify-between items-center rounded-lg">
                <span>Branch</span>
                <span>{BranchName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Pref. Agent 1</span>
                <span>{PreferedAgentId1}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Pref. Agent 2</span>
                <span>{PreferedAgentId2}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Pref. Agent 3</span>
                <span>{PreferedAgentId3}</span>
              </div>
              {isClientCreateAllowed && (
                <div className="flex justify-between items-center rounded-lg">
                  <span>Mapped Template</span>
                  <span>{MappingTemplateId}</span>
                </div>
              )}
              {isClientCreateAllowed && (
                <div className="flex justify-between items-center rounded-lg">
                  <span>Updated By</span>
                  <span>{UpdatedBy}</span>
                </div>
              )}
              {isClientCreateAllowed && (
                <div className="flex justify-between items-center rounded-lg">
                  <span>Last Updated Time</span>
                  <span>{formattedTime}</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
];
