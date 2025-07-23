import { TooltipContent } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface IProps {
  icon;
  label?: string;
  className?: string;
  size?: number;
}

export default function TooltipIcon({
  icon,
  label,
  className,
  size = 12,
}: IProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <icon size={size} className={cn("text-gray-500 mr-2", className)} />
        </TooltipTrigger>
        {label && (
          <TooltipContent>
            <span className="text-xs">{label}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
