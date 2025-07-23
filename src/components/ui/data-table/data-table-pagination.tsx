import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { useIsMobile } from "@/hooks";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  data: TData[];
  page: number;
  totalRecords: number | null;
  recordsPerPage: number;
  isLoading: boolean;
  handlePageChange: React.Dispatch<React.SetStateAction<string>>;
  setRecordsPerPage: React.Dispatch<React.SetStateAction<number>>;
}

export enum PAGE_ACTION_TYPE {
  NEXT = "NEXT",
  PREV = "PREV",
}

export function DataTablePagination<TData>({
  data,
  table,
  page,
  totalRecords,
  recordsPerPage,
  isLoading,
  handlePageChange,
  setRecordsPerPage,
}: DataTablePaginationProps<TData>) {
  const isMobile = useIsMobile();

  const startIndex = page * recordsPerPage + 1;
  let endIndex = (page + 1) * recordsPerPage;
  if (endIndex > totalRecords) endIndex = totalRecords;

  if (data?.length === 0) return null;

  return (
    <div className="flex items-center md:justify-end mt-4 px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center text-sm font-medium">
          {startIndex}-{endIndex} of {totalRecords}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(PAGE_ACTION_TYPE.PREV)}
            disabled={page <= 0 || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(PAGE_ACTION_TYPE.NEXT)}
            disabled={endIndex === totalRecords || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {!isMobile && (
          <Select
            onValueChange={(val) => {
              setRecordsPerPage(Number(val));
              table.setPageSize(Number(val));
            }}
            value={String(recordsPerPage)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Records per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} records
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
