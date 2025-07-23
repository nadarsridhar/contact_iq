import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface CustomTextAreaProps extends TextareaProps {
  showCounter?: boolean;
  maxLimit?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, CustomTextAreaProps>(
  ({ className, showCounter = false, maxLimit = 500, ...props }, ref) => {
    const charactersRemaining = maxLimit - String(props.value).length;
    const isNearLimit = charactersRemaining <= maxLimit * 0.1;
    const isAtLimit = charactersRemaining <= 0;

    return (
      <>
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />

        {showCounter && (
          <div className="flex justify-end mt-1">
            <span
              className={cn(
                "text-xs text-muted-foreground",
                isNearLimit && !isAtLimit && "text-amber-500",
                isAtLimit && "text-destructive font-medium"
              )}
            >
              {charactersRemaining < 0
                ? `${Math.abs(charactersRemaining)} characters over limit`
                : `${charactersRemaining} characters remaining`}
            </span>
          </div>
        )}
      </>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
