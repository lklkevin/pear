import { create } from "zustand";

interface ErrorState {
  errorMessage: string | null;
  setError: (message: string | null) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errorMessage: null,
  setError: (message) => set({ errorMessage: message }),
}));

interface LoadingState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));
