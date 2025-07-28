import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { useClientModal } from "@/hooks/useClientModal";
import ClientsForm from "./ClientsForm";
import { ACTIONS } from "@/utils/actions";

function ClientsModal() {
  const [title, setTitle] = useState("");
  const { isOpen, onClose, data } = useClientModal();
  const { action, modalData = {} } = data.data || {};

  useEffect(() => {
    switch (action) {
      case ACTIONS.CREATE:
        setTitle("Create Client");
        break;

      case ACTIONS.UPDATE:
        setTitle("Update Client");
        break;

      case ACTIONS.DELETE:
        setTitle(`${modalData?.IsDeleted == 0 ? "Delete" : "Restore"} client`);
        break;
    }
  }, [data]);

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose} title={title}>
      <ClientsForm />
    </Modal>
  );
}

export default ClientsModal;
