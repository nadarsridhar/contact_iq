import { create } from 'zustand';

interface ValidatePasswordModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useValidatePassword = create<ValidatePasswordModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: [],
  setData: (data) => set({ data: { data } }),
}));
