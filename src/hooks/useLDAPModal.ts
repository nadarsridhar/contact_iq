import { create } from 'zustand';

interface LDAPModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useLDAPModal = create<LDAPModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: [],
  setData: (data) => set({ data: { data } }),
}));
