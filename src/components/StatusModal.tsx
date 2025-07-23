import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  exportCallTrafficReportApi,
  exportErrorLogFileApi,
} from "@/services/apiExports";
import Export from "@/pages/admin/dashboard/Exports";
import { useIsMobile } from "@/hooks";

interface SuccessModalProps {
  title: string;
  successTitle: string;
  failureTitle: string;
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  exportedFileName?: string;
}

export default function StatusModal({
  title,
  successTitle,
  failureTitle,
  isOpen,
  onClose,
  fileName = "",
  exportedFileName = "",
}: SuccessModalProps) {
  const [isFileExporting, setIsFileExporting] = useState(false);
  const { token } = useAuth();
  const isMobile = useIsMobile();

  const handleFileExport = async () => {
    try {
      setIsFileExporting(true);
      await exportErrorLogFileApi(token, { fileName }, exportedFileName);
      toast.success(`Error logs file fetched successfully`);
    } catch (error) {
      toast.error(`Error while fetching error logs file`);
    } finally {
      setIsFileExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="mb-4">
            <p className="text-green-700 m=0">{successTitle}</p>

            <div className="flex justify-between items-center">
              {failureTitle && (
                <p className="text-red-600 m-0">{failureTitle}</p>
              )}
              {failureTitle && !isMobile && (
                <Export
                  handleFileExport={handleFileExport}
                  isExporting={isFileExporting}
                  label="Error Logs"
                />
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="align-items-center">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
