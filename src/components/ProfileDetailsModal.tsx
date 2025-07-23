import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProfileDetailsModal } from '@/hooks/useProfileDetailsModal';
import ProfileDetailsForm from './ProfileDetailsForm';

export function ProfileDetailsModal() {
  const { isOpen, onClose } = useProfileDetailsModal();

  return (
    <Dialog open={isOpen} modal defaultOpen={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-3xl mb-2 font-bold text-primary">
            Profile
          </DialogTitle>
        </DialogHeader>
        <ProfileDetailsForm />
        <DialogFooter>
          <DialogClose />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
