import { flexRender } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCallStatus } from '@/utils/callStatus';
import columns from '@/pages/clients/components/columns';

export default function ClientLogDesktop({ table }) {
  return (
    <div className="py-10">
      {/* <h1 className="text-2xl font-bold mb-2">Recent calls</h1>
      <Input
        className="max-w-sm mb-4"
        placeholder="Search calls..."
        type="search"
      /> */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const callStatus = getCallStatus(
                row.original.callstatus,
                row.original.calltype
              );

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`${
                    row.index == 0 &&
                    (row.original.callstatus == 1 ||
                      row.original.callstatus == 2)
                      ? `animate-pulse ${callStatus.bgColor}`
                      : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
