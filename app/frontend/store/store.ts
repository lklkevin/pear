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
  loadingMessage: string | null;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string | null) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  loadingMessage: null,
  setLoading: (loading: boolean) => set({ loading }),
  setLoadingMessage: (message: string | null) => set({ loadingMessage: message }),
}));
