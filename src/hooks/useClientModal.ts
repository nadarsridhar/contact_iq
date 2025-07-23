import { create } from 'zustand';

interface ClientModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useClientModal = create<ClientModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: [],
  setData: (data) => set({ data: { data } }),
}));
