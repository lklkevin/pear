import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamForm from "../examForm";

// Mock child components to simplify testing
jest.mock("../../form/inputField", () => ({ placeholder, textarea }: { placeholder: string; textarea?: boolean }) => (
  <input data-testid={textarea ? "textarea" : "input"} placeholder={placeholder} />
));

jest.mock("../../form/fileUpload", () => () => <div data-testid="file-upload">FileUpload</div>);

jest.mock("../../ui/longButtonGreen", () => ({ text }: { text: string }) => <button>{text}</button>);

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="generate-link">{children}</a>
  );
});

describe("ExamForm component", () => {
  test("renders the file upload component", () => {
    render(<ExamForm />);
    
    // Ensure FileUpload is rendered
    expect(screen.getByTestId("file-upload")).toBeInTheDocument();
  });

  test("renders input fields for exam title and description", () => {
    render(<ExamForm />);
    
    // Ensure the exam title field is present
    expect(screen.getByPlaceholderText(/untitled exam/i)).toBeInTheDocument();

    // Ensure the description field is present
    expect(screen.getByPlaceholderText(/what do you want the exam to focus on/i)).toBeInTheDocument();
  });

  test("renders generate button with correct link", () => {
    render(<ExamForm />);
    
    // Ensure the "Generate" button is present
    expect(screen.getByRole("button", { name: /generate/i })).toBeInTheDocument();

    // Ensure the button links to "/generated"
    expect(screen.getByTestId("generate-link")).toHaveAttribute("href", "/generated");
  });
});
