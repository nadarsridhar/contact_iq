import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  allowTooltip?: boolean;
  tooltipText?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  allowTooltip = false,
  tooltipText = "",
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 -ml-3 h-8 data-[state=open]:bg-accent"
          >
            {allowTooltip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="font- text-gray-950 text-sm">{title}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">{tooltipText}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="font- text-gray-950 text-sm">{title}</span>
            )}
            {column.getIsSorted() === "desc" ? (
              <ArrowDown size={12} />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp size={12} />
            ) : (
              <ChevronsUpDown size={12} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(false)}
          >
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(true)}
          >
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem
            className="flex items-center gap-1"
            onClick={() => column.toggleVisibility(false)}
          >
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
