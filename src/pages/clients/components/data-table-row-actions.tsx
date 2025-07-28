import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEditHistory } from "@/hooks/useEditCallHistory";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CallStatusState } from "@/utils";
import { Call } from "@/schemas/call";
import { Row } from "@tanstack/react-table";
import downloadFile from "@/utils/downloadFile";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { useCreateFollowup } from "@/hooks/useCreateFollowup";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<Call>) {
  const { token } = useAuth();
  const { onOpen: handleEditDialogOpen, setData: setUpdateClientDetailsData } =
    useEditHistory();
  const { onOpen: openTaskDialog, setData: setTaskData } = useCreateFollowup();
  const {
    isUpdateCallDetailsAllowed,
    isRecordingDownloadAllowed,
    isFollowupTaskAllowed,
  } = usePrivilege();

  const downloadAudio = async (RecordingName: string) => {
    try {
      await downloadFile(
        "v1/recordings/getRecording",
        { RecordingName },
        RecordingName,
        token
      );
    } catch (error) {
      console.error(`Error while downloading audio`);
    }
  };

  if (!isUpdateCallDetailsAllowed && !isRecordingDownloadAllowed) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-gray-300"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {isUpdateCallDetailsAllowed && (
          <DropdownMenuItem
            onClick={() => {
              handleEditDialogOpen();
              setUpdateClientDetailsData(row.original);
            }}
          >
            Edit
          </DropdownMenuItem>
        )}
        {isRecordingDownloadAllowed &&
          Number(row.original.CallStatus) === CallStatusState.HANGUP && (
            <DropdownMenuItem>
              <Button
                className="p-0"
                variant="ghost"
                onClick={() => downloadAudio(row.original.RecordingName)}
              >
                Download Recording
              </Button>
            </DropdownMenuItem>
          )}

        {isFollowupTaskAllowed && (
          <DropdownMenuItem>
            <Button
              className="p-0"
              variant="ghost"
              onClick={() => {
                openTaskDialog();
                setTaskData(row.original);
                setUpdateClientDetailsData(row.original);
              }}
            >
              Create Followup
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
