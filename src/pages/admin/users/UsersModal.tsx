import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import UsersForm from "./UsersForm";
import { useUserMasterModal } from "@/hooks/useUserMasterModal";
import { ACTIONS } from "@/utils/actions";

function UsersModal() {
  const [title, setTitle] = useState("");
  const { isOpen, onClose, data } = useUserMasterModal();
  const { action, modalData = {} } = data.data || {};

  useEffect(() => {
    switch (action) {
      case ACTIONS.CREATE:
        setTitle(`Create User`);
        break;

      case ACTIONS.UPDATE:
        setTitle(`Update User`);
        break;

      case ACTIONS.DELETE:
        setTitle(`${modalData?.IsDeleted == 0 ? "Delete" : "Restore"} User`);
        break;
    }
  }, [data]);

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose} title={title}>
      <UsersForm />
    </Modal>
  );
}

export default UsersModal;
