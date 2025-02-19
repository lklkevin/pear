import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "../fileUpload";

describe("FileUpload component", () => {
  test("renders file upload label when no files are uploaded", () => {
    render(<FileUpload />);

    // Ensure the upload UI is present
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText(/drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted formats/i)).toBeInTheDocument();
  });

  test("allows file upload and displays file names", () => {
    render(<FileUpload />);
    
    // Mock file
    const file = new File(["dummy content"], "example.pdf", { type: "application/pdf" });

    // Get the hidden input element
    const fileInput = screen.getByLabelText(/drop your file here/i, { selector: "input" });

    // Simulate file upload
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Ensure the file name is displayed
    expect(screen.getByText("example.pdf ✖")).toBeInTheDocument();
  });

  test("hides upload prompt after file selection", () => {
    render(<FileUpload />);

    // Mock file
    const file = new File(["dummy content"], "image.png", { type: "image/png" });

    // Get file input and upload a file
    const fileInput = screen.getByLabelText(/drop your file here/i, { selector: "input" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Ensure upload UI is not visible
    expect(screen.queryByText("+")).not.toBeInTheDocument();
    expect(screen.queryByText(/drop your file here/i)).not.toBeInTheDocument();
  });
});
