import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamForm from "../examForm";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";

// Mocks
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../store/store", () => ({
  useErrorStore: {
    getState: () => ({ setError: jest.fn() }),
  },
  useSuccStore: () => ({ setSuccess: jest.fn() }),
  useLoadingStore: {
    getState: () => ({
      setLoading: jest.fn(),
      setLoadingMessage: jest.fn(),
      setProgress: jest.fn(),
    }),
  },
}));

jest.mock("../../form/stylingOptions", () => ({
  StylingOptions: ({ setSelectedColor }: any) => (
    <button
      onClick={() => setSelectedColor("purple")}
      data-testid="styling-options"
    />
  ),
  colors: [
    { value: "teal", hex: "#14b8a6" },
    { value: "purple", hex: "#8b5cf6" },
    { value: "zinc", hex: "#3f3f46" },
  ],
}));

jest.mock("../../form/visibilityOption", () => ({
  VisibilityOption: ({ label, onChange }: any) => (
    <button onClick={onChange}>{label}</button>
  ),
}));

jest.mock("../../form/inputField", () => (props: any) => (
  <input
    placeholder={props.placeholder}
    value={props.value}
    onChange={props.onChange}
    data-testid={props.placeholder}
  />
));

jest.mock("../../form/fileUpload", () => (props: any) => (
  <div data-testid="file-upload" />
));

jest.mock("../../ui/longButtonGreen", () => (props: any) => (
  <button onClick={props.onClick}>{props.text}</button>
));

jest.mock("../../ui/skeleton", () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

jest.mock("../counter", () => (props: any) => (
  <div>
    <button onClick={() => props.onChange(props.value - 1)}>-</button>
    <span data-testid="counter-value">{props.value}</span>
    <button onClick={() => props.onChange(props.value + 1)}>+</button>
  </div>
));

// Global fetch mock
global.fetch = jest.fn();

describe("ExamForm", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { accessToken: "token" },
      status: "authenticated",
    });
    (useRouter as jest.Mock).mockReturnValue({ push });
    (getSession as jest.Mock).mockResolvedValue({ accessToken: "token" });
  });

  test("renders basic inputs", () => {
    render(<ExamForm />);
    expect(screen.getByTestId("Untitled Exam")).toBeInTheDocument();
    expect(
      screen.getByTestId("What do you want the exam to focus on?")
    ).toBeInTheDocument();
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  test("renders visibility and styling when session exists", () => {
    render(<ExamForm />);
    expect(screen.getByText("Private")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Unsaved")).toBeInTheDocument();
    expect(screen.getByTestId("styling-options")).toBeInTheDocument();
  });

  test("handles user input and counter", () => {
    render(<ExamForm />);
    const titleInput = screen.getByTestId("Untitled Exam");
    fireEvent.change(titleInput, { target: { value: "My Exam" } });
    expect(titleInput).toHaveValue("My Exam");

    const counterValue = screen.getByTestId("counter-value");
    expect(counterValue).toHaveTextContent("5");
    fireEvent.click(screen.getByText("+"));
    expect(screen.getByTestId("counter-value")).toHaveTextContent("6");
  });

  test("handles unsaved visibility", async () => {
    render(<ExamForm />);
    fireEvent.click(screen.getByText("Unsaved"));

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ task_id: "task123" }),
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ state: "SUCCESS", result: {} }),
    });

    const button = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/generate"),
        expect.any(Object)
      )
    );
  });

  test("handles generate failure (no task ID)", async () => {
    render(<ExamForm />);
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ task_id: null }),
    });

    const button = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/generate/save"),
        expect.any(Object)
      )
    );
  });

  test("handles generate error from backend", async () => {
    render(<ExamForm />);
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Something went wrong" }),
    });

    const button = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/generate/save"),
        expect.any(Object)
      )
    );
  });

  test("renders skeletons if session status is loading", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });
    render(<ExamForm />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(1);
  });
});
