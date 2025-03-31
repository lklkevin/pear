import { create } from "zustand";

/**
 * Error state management interface
 * @interface ErrorState
 * @property {string | null} errorMessage - Current error message or null if no error
 * @property {(message: string | null) => void} setError - Function to set or clear error message
 */
interface ErrorState {
  errorMessage: string | null;
  setError: (message: string | null) => void;
}

/**
 * Global error state store
 * Manages application-wide error messages
 */
export const useErrorStore = create<ErrorState>((set) => ({
  errorMessage: null,
  setError: (message) => set({ errorMessage: message }),
}));

/**
 * Success state management interface
 * @interface SuccessState
 * @property {string | null} successMessage - Current success message or null if none
 * @property {(message: string | null) => void} setSuccess - Function to set or clear success message
 */
interface SuccessState {
  successMessage: string | null;
  setSuccess: (message: string | null) => void;
}

/**
 * Global success state store
 * Manages application-wide success messages
 */
export const useSuccStore = create<SuccessState>((set) => ({
  successMessage: null,
  setSuccess: (message) => set({ successMessage: message }),
}));

/**
 * Loading state management interface
 * @interface LoadingState
 * @property {boolean} loading - Whether the application is in a loading state
 * @property {string | null} loadingMessage - Optional message to display during loading
 * @property {number} progressPercentage - Loading progress (0-100)
 * @property {(loading: boolean) => void} setLoading - Function to set loading state
 * @property {(message: string | null) => void} setLoadingMessage - Function to set loading message
 * @property {(progress: number) => void} setProgress - Function to update progress percentage
 */
interface LoadingState {
  loading: boolean;
  loadingMessage: string | null;
  progressPercentage: number;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string | null) => void;
  setProgress: (progress: number) => void;
}

/**
 * Global loading state store
 * Manages application-wide loading states and progress
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  loadingMessage: null,
  progressPercentage: 0,
  setLoading: (loading: boolean) => set({ loading }),
  setLoadingMessage: (message: string | null) =>
    set({ loadingMessage: message }),
  setProgress: (progress: number) => set({ progressPercentage: progress }),
}));
