import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  data: TData[];
  page: number;
  totalRecords: number;
  recordsToDisplay: number;
  isLoading: boolean;
  handlePageChange: React.Dispatch<React.SetStateAction<string>>;
}

export enum PAGE_ACTION_TYPE {
  NEXT = 'NEXT',
  PREV = 'PREV',
}

export function DataTablePagination<TData>({
  data,
  table,
  page,
  totalRecords,
  recordsToDisplay,
  isLoading,
  handlePageChange,
}: DataTablePaginationProps<TData>) {
  const totalPages = Math.ceil(totalRecords / recordsToDisplay);

  return (
    <div className="flex items-center justify-end px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center text-sm font-medium">
          Page {page + 1}
          {/* of {totalPages} */}
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
            disabled={data.length < recordsToDisplay || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
