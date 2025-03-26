import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  username: string;
  setUsername: (name: string) => void;
}

export const useUserStore = create<UserState, [["zustand/persist", UserState]]>(
  persist(
    (set) => ({
      username: "", // default value
      setUsername: (name: string) => set({ username: name }),
    }),
    { name: "user-storage" }
  )
);
