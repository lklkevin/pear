import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamForm from "../examForm";

// Mock Next.js router to prevent "NextRouter was not mounted" errors
jest.mock("next/router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock next-auth so that useSession doesn't require a SessionProvider
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  getSession: () => Promise.resolve(null),
}));

// Mock child components to isolate ExamForm testing
jest.mock(
  "../../form/inputField",
  () =>
    ({ placeholder, textarea }: { placeholder: string; textarea?: boolean }) =>
      (
        <input
          data-testid={textarea ? "textarea" : "input"}
          placeholder={placeholder}
        />
      )
);

jest.mock("../../form/fileUpload", () => () => (
  <div data-testid="file-upload">FileUpload</div>
));

jest.mock("../../ui/longButtonGreen", () => ({ text }: { text: string }) => (
  <button>{text}</button>
));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("ExamForm component", () => {
  test("renders the file upload component", () => {
    render(<ExamForm />);
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  test("renders input fields for exam title and description", () => {
    render(<ExamForm />);
    expect(screen.getByPlaceholderText(/untitled exam/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/what do you want the exam to focus on/i)
    ).toBeInTheDocument();
  });

  test("renders generate button", () => {
    render(<ExamForm />);
    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();
  });
});
