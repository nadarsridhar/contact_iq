import Modal from "@/components/ui/Modal";
import { useApiKeysModal } from "@/hooks/useApiKeysModal";

import ApiKeyGenerator from "./ApiKeyGenerator";

function ApiKeysModal() {
  const { isOpen, onClose } = useApiKeysModal();

  return (
    <Modal size="4xl" isOpen={isOpen} onClose={onClose} title={""}>
      <ApiKeyGenerator />
    </Modal>
  );
}

export default ApiKeysModal;
