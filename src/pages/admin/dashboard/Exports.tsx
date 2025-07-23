import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Export({ handleFileExport, label, isExporting = false }) {
  return (
    <Button
      className="flex items-center"
      variant="outline"
      onClick={handleFileExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Download size={14} />
      )}
      <span className="ml-2">{isExporting ? "Exporting.." : label}</span>
    </Button>
  );
}

export default Export;
