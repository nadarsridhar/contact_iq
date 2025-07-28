import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingInfoState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from "./data-table-toolbar";
import ListView from "@/components/ListView";
import { useIsMobile } from "@/hooks";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { useEffect, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  tableId: string;
  data: TData[];
  totalRecords: number | null;
  page: number;
  recordsPerPage: number;
  isLoading: boolean;
  handlePageChange: React.Dispatch<React.SetStateAction<string>>;
  setRecordsPerPage: React.Dispatch<React.SetStateAction<number>>;
  contextMenuItems?: any;
}

export function DataTable<TData, TValue>({
  columns,
  totalRecords,
  page,
  tableId,
  recordsPerPage,
  data,
  isLoading,
  handlePageChange,
  setRecordsPerPage,
  contextMenuItems = [],
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibilityData, setcolumnVisibilityData] = useState(() => {
    const savedSizes = localStorage.getItem(`columnVisibility`);
    return savedSizes ? JSON.parse(savedSizes) : {};
  });

  const [columnVisibility, setColumnVisibility] = useState(() => {
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

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
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    columnResizeDirection: "ltr",
  });

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

  const isMobile = useIsMobile();

  return (
    <div style={{ width: isMobile ? "70vw" : "100%" }}>
      {/* <div>
        <DataTableToolbar table={table} />
      </div>       */}
      <ListView
        handleDefaultColumnSizes={handleDefaultColumnSizes}
        setColumnVisibility={setColumnVisibility}
        columnInfo={columnInfo}
        isLoading={isLoading}
        table={table}
        recordsPerPage={recordsPerPage}
        contextMenuItems={contextMenuItems}
      />
      <DataTablePagination
        data={data}
        table={table}
        totalRecords={totalRecords}
        page={page}
        recordsPerPage={recordsPerPage}
        isLoading={isLoading}
        handlePageChange={handlePageChange}
        setRecordsPerPage={setRecordsPerPage}
      />
    </div>
  );
}
