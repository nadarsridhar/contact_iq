import { create } from 'zustand';

interface ChangePasswordModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useChangePassword = create<ChangePasswordModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: [],
  setData: (data) => set({ data: { data } }),
}));
