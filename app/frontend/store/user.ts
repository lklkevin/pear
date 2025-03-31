import { create } from "zustand";

/**
 * User state management interface
 * @interface UserStore
 * @property {string} username - Current user's username
 * @property {(username: string) => void} setUsername - Function to update username
 * @property {() => void} reset - Function to reset user state to initial values
 */
interface UserStore {
  username: string;
  setUsername: (username: string) => void;
  reset: () => void;
}

/**
 * Global user state store
 * Manages user-related state including:
 * - Username storage and updates
 * - State reset functionality
 */
export const useUserStore = create<UserStore>((set) => ({
  username: "",
  setUsername: (username) => set({ username }),
  reset: () => set({ username: "" }),
}));
