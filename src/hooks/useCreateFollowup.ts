import { create } from "zustand";

// To display follow up form
interface CreateFollowup {
  triggerApiRefresh: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
  setTriggerApiRefresh: () => void;
}

export const useCreateFollowup = create<CreateFollowup>((set) => ({
  isOpen: false,
  triggerApiRefresh: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false, data: {} }),
  data: {},
  setData: (data) => set({ data }),
  setTriggerApiRefresh: () => {
    set({ triggerApiRefresh: true });
    // Reset after a second
    setTimeout(() => {
      set({ triggerApiRefresh: false });
    }, 1000);
  },
}));

// To display followup details for a call record
interface FollowupDetails {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: any;
  setData(data: any): void;
}

export const useFollowupDetails = create<FollowupDetails>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false, data: {} }),
  data: {},
  setData: (data) => set({ data }),
}));

// To display followups
type FollowUpModalState = {
  modals: {
    [id: string]: { open: boolean; data: any };
  };
  openModal: (id: string, data: any) => void;
  closeModal: (id: string) => void;
};

// To display followups
export const useFollowUpModalStore = create<FollowUpModalState>((set) => ({
  modals: {},

  openModal: (id, data) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { open: true, data },
      },
    })),

  closeModal: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.modals;
      return { modals: rest };
    }),
}));
