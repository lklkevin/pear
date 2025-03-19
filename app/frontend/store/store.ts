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
  progressPercentage: number; 
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string | null) => void;
  setProgress: (progress: number) => void; 
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  loadingMessage: null,
  progressPercentage: 0, 
  setLoading: (loading: boolean) => set({ loading }),
  setLoadingMessage: (message: string | null) => set({ loadingMessage: message }),
  setProgress: (progress: number) => set({ progressPercentage: progress }),
}));

