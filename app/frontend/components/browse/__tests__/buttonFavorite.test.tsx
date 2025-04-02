import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Favorite from "../buttonFavorite";
import { useSession, getSession } from "next-auth/react";

// Mocks
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  getSession: jest.fn(),
}));

const setError = jest.fn();

jest.mock("../../../store/store", () => ({
  useErrorStore: {
    getState: () => ({
      setError,
    }),
  },
}));

describe("Favorite", () => {
  const defaultProps = {
    examId: 123,
    initialFavorite: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { accessToken: "token" },
    });
    (getSession as jest.Mock).mockResolvedValue({ accessToken: "token" });
  });

  test("does not render if session is not present", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    const { container } = render(<Favorite {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders favorite_border icon when not a favorite", () => {
    render(<Favorite {...defaultProps} />);
    expect(screen.getByText("favorite_border")).toBeInTheDocument();
  });

  test("renders favorite icon when initially a favorite", () => {
    render(<Favorite {...defaultProps} initialFavorite={true} />);
    expect(screen.getByText("favorite")).toBeInTheDocument();
  });

  test("toggles favorite icon on click", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<Favorite {...defaultProps} />);
    const icon = screen.getByText("favorite_border");

    fireEvent.click(icon);
    await waitFor(() => {
      expect(screen.getByText("favorite")).toBeInTheDocument();
    });
  });

  test("does not toggle during loading", async () => {
    let resolveFetch: Function = () => {};
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<Favorite {...defaultProps} />);
    const icon = screen.getByText("favorite_border");

    fireEvent.click(icon);
    fireEvent.click(icon); // second click should be ignored

    // resolve the fetch
    resolveFetch?.({
      ok: true,
      json: async () => ({}),
    });

    await waitFor(() => {
      expect(screen.getByText("favorite")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("handles error response from API", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Error occurred" }),
    });

    render(<Favorite {...defaultProps} />);
    const icon = screen.getByText("favorite_border");

    fireEvent.click(icon);

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Failed to update favorite status");
      expect(screen.getByText("favorite_border")).toBeInTheDocument(); // reverted back
    });
  });

  test("handles error from fetch", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(<Favorite {...defaultProps} />);
    const icon = screen.getByText("favorite_border");

    fireEvent.click(icon);

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Failed to update favorite status");
    });
  });
});
