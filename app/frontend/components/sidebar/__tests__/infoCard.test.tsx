import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GettingStarted from "../infoCard"; // adjust path as needed

describe("GettingStarted (InfoCard)", () => {
  const defaultProps = {
    number: 1,
    mainText: "Upload your files",
    text: "We’ll scan them and generate questions.",
  };

  test("renders number, mainText, and text", () => {
    render(<GettingStarted {...defaultProps} />);

    // Check that all texts appear correctly
    expect(
      screen.getByText(defaultProps.number.toString())
    ).toBeInTheDocument();
    expect(screen.getByText(defaultProps.mainText)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });

  test("renders with appropriate structure", () => {
    const { container } = render(<GettingStarted {...defaultProps} />);

    // Should have three children: number, vertical divider, and text content
    const wrapperDiv = container.firstChild as HTMLElement;
    expect(wrapperDiv).toHaveClass("flex");
    expect(wrapperDiv.querySelector("h2")).toHaveTextContent(
      defaultProps.mainText
    );
    expect(wrapperDiv.querySelector("p")).toHaveTextContent(defaultProps.text);
  });
});
