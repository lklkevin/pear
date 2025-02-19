import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfidenceBar from "../confidenceBar";

describe("ConfidenceBar component", () => {
  test("renders the confidence label", () => {
    render(<ConfidenceBar confidence={75} />);

    // Ensure the label is displayed
    expect(screen.getByText(/confidence:/i)).toBeInTheDocument();
  });

  test("displays the correct confidence percentage", () => {
    render(<ConfidenceBar confidence={75} />);

    // Ensure the confidence percentage is displayed correctly
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});
