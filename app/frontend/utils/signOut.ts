import { signOut } from "next-auth/react";

export default async function signOutWithBackend(refreshToken?: string) {
  if (refreshToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (error) {
      console.error("Failed to revoke refresh token on backend:", error);
    }
  }

  signOut();
}
