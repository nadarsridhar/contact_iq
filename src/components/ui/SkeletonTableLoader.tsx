import { TableBody, TableCell, TableRow } from "./table";

function SkeletonTableLoader({
  rowsLength,
  columnsLength,
}: {
  rowsLength: number;
  columnsLength: number;
}) {
  return (
    <TableBody>
      {Array.from({ length: rowsLength }).map((_, rowIdx) => (
        <TableRow className="" key={rowIdx}>
          {Array.from({ length: columnsLength }).map((_, colIdx) => (
            <TableCell
              className="h-8 bg-gray-300 rounded animate-pulse"
              key={colIdx}
            ></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default SkeletonTableLoader;
