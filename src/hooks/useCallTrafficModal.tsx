import { create } from "zustand";

export interface CallTrafficClientDetailsModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useCallTrafficClientDetailsModal =
  create<CallTrafficClientDetailsModal>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    data: [],
    setData: (data) => set({ data: { data } }),
  }));
