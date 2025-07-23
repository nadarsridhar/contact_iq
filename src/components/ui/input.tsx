import * as React from "react";

import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useIsMobile } from "@/hooks";
import { XIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

interface CustomInputProps extends InputProps {
  isSearch?: boolean;
  onClear?: () => void | boolean;
  onClearClassName?: string;
  onClearFile?: () => void | boolean;
  file?: null | FormData;
}

const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      className,
      type,
      isSearch = false,
      onClear = false,
      onClearClassName = "",
      onClearFile = false,
      file = null,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();

    return (
      <div className="relative flex items-center w-full">
        <input
          type={type}
          className={cn(
            `flex h-9 bg-gray-200 w-full rounded-md border px-3 py-1 ${
              isSearch ? "pl-8" : ""
            } text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          autoComplete={props.name}
          ref={ref}
          {...props}
        />
        {isSearch && (
          <div className="absolute top-50 left-3">
            <MagnifyingGlassIcon
              className="text-gray-500"
              width={12}
              height={12}
            />
          </div>
        )}

        {!isMobile && onClear && props.value && (
          <XIcon
            className={`absolute right-2 cursor-pointer opacity-50 ${onClearClassName}`}
            onClick={onClear}
            size={14}
          />
        )}

        {onClearFile && file && (
          <XIcon
            className={`absolute right-2 bottom-3 cursor-pointer opacity-50 ${onClearClassName}`}
            onClick={onClearFile}
            size={12}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
