import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEditHistory } from "@/hooks/useEditCallHistory";
import EditDialogForm from "./EditDialogForm";

export function EditCallerInfoDialog({ loadCallLogs }) {
  const { isOpen, onClose, data: clientDetailsData } = useEditHistory();
  if (!clientDetailsData?.data) return null;

  return (
    <Dialog open={isOpen} modal defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded w-4/5 md:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl mb-2 font-bold text-primary">
            Edit details for {clientDetailsData.data.ClientId}
          </DialogTitle>
        </DialogHeader>
        <EditDialogForm
          clientDetailsData={clientDetailsData.data}
          loadCallLogs={loadCallLogs}
        />
        <DialogFooter>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
