import { create } from "zustand";

interface CallTasksModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useCallTasksModal = create<CallTasksModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  data: [],
  setData: (data) => set({ data: { data } }),
}));
