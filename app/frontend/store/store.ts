import { create } from "zustand";

interface ErrorState {
  errorMessage: string | null;
  setError: (message: string | null) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errorMessage: null,
  setError: (message) => set({ errorMessage: message }),
}));
