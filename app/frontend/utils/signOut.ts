import { signOut } from "next-auth/react";
import { useUserStore } from "../store/user";

/**
 * Handles complete user sign out process
 * - Invalidates refresh token on backend if provided
 * - Resets user store state
 * - Signs out from NextAuth session
 * 
 * @param {string} [refreshToken] - Optional refresh token to invalidate
 * @returns {Promise<void>} Promise that resolves when sign out is complete
 * @throws {Error} Silently handles backend logout errors
 */
export default async function signOutWithBackend(refreshToken?: string) {
  if (refreshToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      // Silently handle backend logout errors
    }
  }

  useUserStore.getState().reset();

  signOut();
}
