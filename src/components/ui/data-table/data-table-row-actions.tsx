
import { Row } from "@tanstack/react-table";
import {
  ArchiveRestoreIcon,
  EditIcon,
  KeyIcon,
  MoreVertical,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACTIONS } from "@/utils/actions";
import { useState } from "react";
import Modal from "../Modal";
import { resetUserPasswordApi } from "@/services/apiUser";
import { useAuth } from "@/contexts/AuthContext";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onOpen: () => void;
  setData: (data: any) => void;
  allowEdit: boolean;
  allowDelete: boolean;
  allowPasswordReset?: boolean;
}

export function DataTableRowActions<TData>({
  row,
  onOpen: handleModalOpen,
  setData,
  allowEdit = false,
  allowDelete = false,
  allowPasswordReset = false,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false);
  const { agent } = useAuth();

  const handleEdit = () => {
    setData({ action: ACTIONS.UPDATE, modalData: row.original });
    handleModalOpen();
  };

  const handleDelete = () => {
    setData({ action: ACTIONS.DELETE, modalData: row.original });
    handleModalOpen();
  };

  const handlePasswordUpdate = async () => {
    setOpen(true);

    try {
      const payload = {
        Password: "",
        UserId: row.original.UserId,
        LoginId: agent.UserId,
      };
      await resetUserPasswordApi(payload);
      toast.success(`Password updated successfully for ${row.original.UserId}`);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setOpen(false);
    }
  };

  const isDeleted = row.original?.IsDeleted == 1;

  if (!allowEdit && !allowDelete && !allowPasswordReset) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-4 w-4 p-0 data-[state=open]:bg-muted"
        >
          <MoreVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[120px]">
        {allowEdit && (
          <DropdownMenuItem
            className="hover:bg-gray-200 cursor-pointer"
            onClick={handleEdit}
          >
            Edit
          </DropdownMenuItem>
        )}
        {allowDelete && (
          <DropdownMenuItem
            className="hover:bg-gray-200 cursor-pointer"
            onClick={handleDelete}
          >
            {isDeleted ? "Restore" : "Delete"}
          </DropdownMenuItem>
        )}
        {allowPasswordReset && (
          <DropdownMenuItem
            className="hover:bg-gray-200 cursor-pointer"
            onClick={() => setOpen(true)}
          >
            Reset Password
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>

      <Modal
        size="xl"
        isOpen={open}
        onClose={() => setOpen(false)}
        title={"Reset Password"}
        description={`Are you sure you want to reset password to default for ${row.original.UserId}?`}
      >
        <div className="flex justify-end items-center gap-4">
          <Button onClick={handlePasswordUpdate}>Confirm</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </DropdownMenu>
  );
}

export function DataMobileTableRowActions<TData>({
  row,
  onOpen: handleModalOpen,
  setData,
  allowDelete = false,
  allowEdit = false,
  allowPasswordReset = false,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false);

  if (!allowEdit && !allowDelete && !allowPasswordReset) return null;

  const isDeleted = row.original?.IsDeleted == 1;

  const handleEdit = (e) => {
    e.preventDefault();
    setData({ action: ACTIONS.UPDATE, modalData: row.original });
    handleModalOpen();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    setData({ action: ACTIONS.DELETE, modalData: row.original });
    handleModalOpen();
  };

  const handlePasswordUpdate = async () => {
    setOpen(true);

    try {
      const payload = {
        Password: "",
        UserId: row.original.UserId,
        LoginId: agent.UserId,
      };
      await resetUserPasswordApi(payload);
      toast.success(`Password update successful for ${row.original.UserId}`);
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="flex gap-2">
      {allowEdit && (
        <EditIcon className="text-green-700 w-5 h-5" onClick={handleEdit} size={16} />
      )}

      {allowDelete && !isDeleted && (
        <Trash className="text-red-700 w-5 h-5" onClick={handleDelete} size={16} />
      )}

      {allowDelete && isDeleted && (
        <ArchiveRestoreIcon
          className="text-red-700"
          onClick={handleDelete}
          size={16}
        />
      )}

      {allowPasswordReset && (
        <KeyIcon size={16} onClick={() => setOpen(true)} />
      )}
      {allowPasswordReset && (
        <Modal
          size="xl"
          isOpen={open}
          onClose={() => setOpen(false)}
          title={"Reset Password"}
          description={`Are you sure you want to reset password to default for ${row.original.UserId}?`}
        >
          <div className="flex justify-end items-center gap-4">
            <Button onClick={handlePasswordUpdate}>Confirm</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
