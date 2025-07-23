import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnResizeMode,
  ColumnSizingInfoState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Modal from "@/components/ui/Modal";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks";
import { DataTablePagination } from "./data-table-pagination";
import SkeletonTableLoader from "../SkeletonTableLoader";
import { useState, useEffect } from "react";
import ProfilerModal from "@/components/ProfilerModal";
import { Button } from "../button";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../context-menu";
import { ACTIONS } from "@/utils/actions";
import { resetUserPasswordApi } from "@/services/apiUser";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRecords: number;
  page: number;
  recordsPerPage: number;
  rowSelection?: any;
  setRowSelection?: any;
  getRowId?: any;
  isLoading: boolean;
  handlePageChange: React.Dispatch<React.SetStateAction<string>>;
  setRecordsPerPage?: React.Dispatch<React.SetStateAction<number>>;
  hidePagination?: boolean;
  tableId: string;
  onOpen: () => void;
  setData(data: any): void;
  isUpdateAllowed?: boolean;
  isDeleteAllowed?: boolean;
  isResetPassordAllowed?: boolean;
}

export function DataTable<TData, TValue>({
  rowSelection = {},
  setRowSelection = null,
  columns,
  data,
  totalRecords,
  page,
  isLoading,
  handlePageChange,
  recordsPerPage,
  getRowId = null,
  setRecordsPerPage,
  hidePagination = false,
  tableId,
  setData,
  onOpen: handleModalOpen,
  isUpdateAllowed = false,
  isDeleteAllowed = false,
  isResetPassordAllowed = false,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);
  const { agent } = useAuth();
  const ShowActionModal =
    isUpdateAllowed || isDeleteAllowed || isResetPassordAllowed;
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange");

  const [columnVisibilityData, setcolumnVisibilityData] = useState(() => {
    const savedSizes = localStorage.getItem(`columnVisibility`);
    return savedSizes ? JSON.parse(savedSizes) : {};
  });
  const [columnVisibility, setColumnVisibility] = React.useState(() => {
    const savedVisibility = localStorage.getItem(`columnVisibility`);
    const data = savedVisibility ? JSON.parse(savedVisibility) : {};
    return data[tableId];
  });
  useEffect(() => {
    setcolumnVisibilityData((PreVal) => {
      const PreviousTableData = PreVal[tableId] || {};
      return {
        ...PreVal,
        [tableId]: {
          ...PreviousTableData,
          ...columnVisibility,
        },
      };
    });
  }, [columnVisibility, tableId]);
  useEffect(() => {
    localStorage.setItem(
      `columnVisibility`,
      JSON.stringify(columnVisibilityData)
    );
  }, [columnVisibilityData]);

  const [columnSizeData, setColumnSizeData] = useState<Record<string, number>>(
    () => {
      const savedSizes = localStorage.getItem(`columnSize`);
      return savedSizes ? JSON.parse(savedSizes) : {};
    }
  );
  const [columnSizing, setColumnSizing] = useState(() => {
    const savedSizes = localStorage.getItem(`columnSize`);
    const data = savedSizes ? JSON.parse(savedSizes) : {};
    return data[tableId] ? data[tableId] : {};
  });

  useEffect(() => {
    setColumnSizeData((PreVal) => {
      const PreviousTableData = PreVal[tableId] || {};
      return {
        ...PreVal,
        [tableId]: {
          ...PreviousTableData,
          ...columnSizing,
        },
      };
    });
  }, [columnSizing, tableId]);

  useEffect(() => {
    localStorage.setItem(`columnSize`, JSON.stringify(columnSizeData));
  }, [columnSizeData]);

  const [columnSizingInfo, setColumnSizingInfo] =
    useState<ColumnSizingInfoState>({
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      isResizingColumn: false,
      columnSizingStart: [],
    });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnSizing,
      columnSizingInfo,
      pagination: {
        pageSize: recordsPerPage,
        pageIndex: 0,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    columnResizeDirection: "ltr",
  });

  const isInactiveRow = (row: TData): boolean => {
    return (
      typeof row === "object" &&
      row !== null &&
      "ActiveFlag" in row &&
      (row as any).ActiveFlag === 0
    );
  };

  const isDeleted = (row: TData): boolean => {
    return (
      typeof row === "object" &&
      row !== null &&
      "IsDeleted" in row &&
      (row as any).IsDeleted === 1
    );
  };

  const handleColumnVisibilityChange = (
    columnId: string,
    isVisible: boolean
  ) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: isVisible,
    }));
  };

  const columnInfo = table.getAllColumns().map((column) => {
    const header =
      typeof column.columnDef.header === "function"
        ? column.id
        : column.columnDef.header;

    return {
      id: column.id,
      header: header as string,
      isVisible: column.getIsVisible(),
    };
  });

  function handleDefaultColumnSizes() {
    table.resetColumnSizing();

    setColumnSizeData((prev) => {
      const newData = { ...prev };
      delete newData[tableId];
      return newData;
    });
  }

  const handleDelete = (row) => {
    setData({ action: ACTIONS.DELETE, modalData: row });
    handleModalOpen();
  };

  const handleEdit = (row) => {
    setData({ action: ACTIONS.UPDATE, modalData: row });
    handleModalOpen();
  };

  const handlePasswordUpdate = async () => {
    if (!selectedRow) return;

    try {
      const payload = {
        Password: "",
        UserId: (selectedRow as any).UserId,
        LoginId: agent.UserId,
      };
      await resetUserPasswordApi(payload);
      toast.success(
        `Password updated successfully for ${(selectedRow as any).UserId}`
      );
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setOpen(false);
      setSelectedRow(null);
    }
  };

  const ActionButtons = [
    {
      label: () => "Edit",
      onClick: (row) => {
        handleEdit(row.original);
      },
      isPrivilage: () => {
        return isUpdateAllowed;
      },
    },
    {
      label: (row) => (isDeleted(row.original) ? "Restore" : "Delete"),
      onClick: (row) => {
        handleDelete(row.original);
      },
      isPrivilage: (row) => {
        return isDeleteAllowed;
      },
    },
    {
      label: () => "Reset Password",
      onClick: (row) => {
        setOpen(true);
        setSelectedRow(row.original);
      },
      isPrivilage: (row) => {
        return isResetPassordAllowed;
      },
    },
  ];

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
    <div className="space-y-4 h-full">
      <div className="rounded-lg border border-stale-300 overflow-x-auto">
        <Table className="w-full table-fixed">
          {!isMobile && (
            <ContextMenu modal={false}>
              <ContextMenuTrigger asChild>
                <TableHeader className="bg-gray-300">
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
                              className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-500 transition-colors ${
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
              <ContextMenuContent className="p-0 border-none relative z-50">
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
                    const isInactive = isInactiveRow(row.original);

                    if (row.isPlaceholder) {
                      return (
                        <TableRow key={row.id} className="h-8">
                          {Array.from({ length: columns.length }).map(
                            (_, i) => (
                              <TableCell key={i} />
                            )
                          )}
                        </TableRow>
                      );
                    }

                    return (
                      <ContextMenu key={row.id} modal={false}>
                        <ContextMenuTrigger asChild>
                          <TableRow
                            data-state={row.getIsSelected() && "selected"}
                            className={`hover:bg-gray-200 h-8 ${
                              isInactive ? "opacity-50" : ""
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                data-column-id={cell.column.id}
                                className="overflow-hidden"
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
                            ))}
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent
                          className={!ShowActionModal && "hidden"}
                        >
                          {ActionButtons.map((item) => {
                            const isPrivilage = item.isPrivilage(row);
                            if (!isPrivilage) return;
                            return (
                              <ContextMenuItem
                                className="hover:bg-gray-200 cursor-pointer"
                                onClick={() => {
                                  item.onClick(row);
                                }}
                              >
                                {item.label(row)}
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
      {!hidePagination && (
        <DataTablePagination
          table={table}
          totalRecords={totalRecords}
          page={page}
          recordsPerPage={recordsPerPage}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
          data={data}
          setRecordsPerPage={setRecordsPerPage}
        />
      )}

      <Modal
        size="xl"
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setSelectedRow(null);
        }}
        title={"Reset Password"}
        description={`Are you sure you want to reset password to default for ${
          selectedRow ? (selectedRow as any).UserId : ""
        }?`}
      >
        <div className="flex justify-end items-center gap-4">
          <Button onClick={handlePasswordUpdate}>Confirm</Button>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setSelectedRow(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
