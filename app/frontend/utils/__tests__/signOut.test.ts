import signOutWithBackend from "../signOut"; // adjust path
import { signOut } from "next-auth/react";

// Mocks
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

const mockReset = jest.fn();

jest.mock("../../store/user", () => ({
  useUserStore: {
    getState: () => ({
      reset: mockReset,
    }),
  },
}));

global.fetch = jest.fn();

describe("signOutWithBackend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls backend logout and resets user store when refreshToken is provided", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await signOutWithBackend("sample-refresh-token");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/logout"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "sample-refresh-token" }),
      })
    );
    expect(mockReset).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  test("does not call fetch when refreshToken is not provided", async () => {
    await signOutWithBackend();

    expect(fetch).not.toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });

  test("gracefully handles fetch error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await signOutWithBackend("bad-token");

    // fetch fails but still continues
    expect(fetch).toHaveBeenCalled();
    expect(mockReset).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });
});
