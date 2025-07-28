import Modal from '@/components/ui/Modal';
import BranchForm from './BranchForm';
import { useBranchModal } from '@/hooks/useBranchModal';
import { ACTIONS } from '@/utils/actions';
import { useEffect, useState } from 'react';

function BranchModal() {
  const { isOpen, onClose, data } = useBranchModal();
  const [title, setTitle] = useState('');
  const { action } = data.data || {};

  useEffect(() => {
    switch (action) {
      case ACTIONS.CREATE:
        setTitle('Create Branch');
        break;

      case ACTIONS.UPDATE:
        setTitle('Update Branch');
        break;

      case ACTIONS.DELETE:
        setTitle('Delete Branch');
        break;
    }
  }, [data]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <BranchForm />
    </Modal>
  );
}

export default BranchModal;
