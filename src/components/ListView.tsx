import { flexRender } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import columns from "@/pages/recent-calls/components/columns";
import { CallStatusState, getCallStatus } from "@/utils";
import { useIsMobile } from "@/hooks";
import SkeletonTableLoader from "@/components/ui/SkeletonTableLoader";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";
import ProfilerModal from "./ProfilerModal";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { ContextMenuItem } from "./ui/context-menu";

export const getCallTypeColor = (type: string) => {
  switch (type) {
    case "incoming":
    case "accepted":
    case "outgoing":
    case "initial":
      return "bg-yellow-100 text-yellow-800";

    case "missed":
    case "rejected":
    case "terminated":
      return "bg-red-100 text-red-800";

    case "in progress":
    case "established":
      return "bg-green-100 text-green-800";
  }
};

export default function ListView({
  table,
  isLoading,
  recordsPerPage,
  setColumnVisibility,
  columnInfo,
  handleDefaultColumnSizes,
  contextMenuItems = [],
}) {
  const isMobile = useIsMobile();
  const { isUpdateCallDetailsAllowed, isRecordingDownloadAllowed } =
    usePrivilege();

  const handleColumnVisibilityChange = (
    columnId: string,
    isVisible: boolean
  ) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: isVisible,
    }));
  };

  const ShowActionModal =
    isUpdateCallDetailsAllowed || isRecordingDownloadAllowed;

  const pageSize = table.getState().pagination.pageSize;
  const pageRows = table.getRowModel().rows;

  const filledRows = [
    ...pageRows,
    ...Array.from({ length: pageSize - pageRows.length }, (_, i) => ({
      id: `empty-${i}`,
      isPlaceholder: true,
    })),
  ];

  return (
    <div className="overflow-x-auto md:h-[400px]">
      <Table className="md:border border-stale-300 table-fixed">
        {!isMobile && (
          <ContextMenu modal={false}>
            <ContextMenuTrigger asChild>
              <TableHeader className="bg-gray-200 group">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          className="py-2 text-gray-950 relative overflow-hidden"
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{
                            width: header.getSize(),
                            minWidth: 30,
                            maxWidth: 500,
                          }}
                        >
                          <div
                            data-column-id={header.column.id}
                            className="truncate pl-2.5"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </div>
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute group-hover:block hidden right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-500 transition-colors ${
                              header.column.getIsResizing()
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          />
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
            </ContextMenuTrigger>
            <ContextMenuContent className="relative z-50">
              <ProfilerModal
                handleDefaultColumnSizes={handleDefaultColumnSizes}
                columns={columnInfo}
                onColumnVisibilityChange={handleColumnVisibilityChange}
              />
            </ContextMenuContent>
          </ContextMenu>
        )}
        {isLoading ? (
          <SkeletonTableLoader
            rowsLength={recordsPerPage}
            columnsLength={table.getAllColumns().length}
          />
        ) : (
          <TableBody className="text-gray-950">
            {table.getRowModel().rows?.length 
              ? filledRows.map((row) => {
                  const callStatus = getCallStatus(
                    row.original?.CallStatus,
                    row.original?.CallType
                  );

                  if (row.isPlaceholder) {
                    return (
                      <TableRow key={row.id} className="h-8">
                        {Array.from({ length: columns.length }).map((_, i) => (
                          <div>
                            <TableCell key={i} />
                          </div>
                        ))}
                      </TableRow>
                    );
                  }
                  return (
                    <ContextMenu modal={false}>
                      <ContextMenuTrigger asChild>
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            "hover:bg-gray-100 md:hover:bg-gray-300 h-8",
                            `${
                              row.original.CallStatus ==
                                CallStatusState.INCOMING ||
                              row.original.CallStatus ==
                                CallStatusState.ANSWERED
                                ? `animate-pulse ${callStatus.bgColor}`
                                : ""
                            }`
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {
                            return (
                              <TableCell
                                data-column-id={cell.column.id}
                                className="md:pl-2 overflow-hidden"
                                key={cell.id}
                                style={{
                                  width: cell.column.getSize(),
                                  minWidth: 30,
                                  maxWidth: 500,
                                }}
                              >
                                <div className="truncate md:h-7 flex items-center">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent
                        className={
                          !ShowActionModal || contextMenuItems.length === 0
                            ? "hidden"
                            : "w-[140px] bg-white p-2 border shadow-lg rounded-lg"
                        }
                      >
                        {contextMenuItems.map((item) => {
                          const isPrivilage = item.isPrivilage(row);
                          if (!isPrivilage) return;
                          return (
                            <ContextMenuItem
                              className="whitespace-nowrap"
                              onClick={() => {
                                item.onClick(row);
                              }}
                            >
                              {item.label}
                            </ContextMenuItem>
                          );
                        })}
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
              : [...Array(recordsPerPage).keys()].map(() => {
                  return (
                    <TableRow className="h-8">
                      {Array.from({ length: columns.length }).map((_, i) => (
                        <TableCell key={i} />
                      ))}
                    </TableRow>
                  );
                })}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
