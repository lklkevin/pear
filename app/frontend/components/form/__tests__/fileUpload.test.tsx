import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "../fileUpload";

describe("FileUpload component", () => {
  test("renders file upload label when no files are uploaded", () => {
    render(<FileUpload />);

    // Use a custom matcher to check that the dropzone prompt is rendered
    expect(
      screen.getByText((content) =>
        content.toLowerCase().includes("drop your files here")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.toLowerCase().includes("accepted formats")
      )
    ).toBeInTheDocument();
  });

  test("allows file upload and displays file names", () => {
    const { container } = render(<FileUpload />);

    // Create a mock file that is accepted (PDF)
    const file = new File(["dummy content"], "example.pdf", {
      type: "application/pdf",
    });

    // Get the file input element using querySelector since it is hidden
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Simulate file upload
    fireEvent.change(fileInput!, { target: { files: [file] } });

    // Ensure the file name is displayed (the name is rendered in a span)
    expect(screen.getByText("example.pdf")).toBeInTheDocument();
  });

  test("hides original upload prompt after file selection", () => {
    const { container, queryByText } = render(<FileUpload />);

    // Create a mock file that is accepted (PDF)
    const filePdf = new File(["dummy content"], "example.pdf", {
      type: "application/pdf",
    });

    // Get the file input element
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    // Simulate file upload
    fireEvent.change(fileInput!, { target: { files: [filePdf] } });

    // Once a file is uploaded, the prompt text changes to "Add more files" instead of "Drop your files here"
    // So we verify that the original text is no longer present.
    expect(
      queryByText((content) =>
        content.toLowerCase().includes("drop your files here")
      )
    ).not.toBeInTheDocument();
  });
});
