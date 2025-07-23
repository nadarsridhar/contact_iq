import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
  className?: string;
}

function Modal({
  size = "md",
  isOpen,
  onClose,
  title,
  children,
  description = "",
  className = "",
}: ModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  return (
    <Dialog open={isOpen} modal defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          `max-w-[600px] w-11/12 rounded-sm`,
          sizeClasses[size],
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-left text-gray-900 font-bold">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
