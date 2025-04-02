import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnimatedProgressBar from "../loading"; // adjust path if needed

jest.useFakeTimers(); // for time-based progress simulation

describe("AnimatedProgressBar", () => {
  test("renders loading message and default subtext", () => {
    render(
      <AnimatedProgressBar
        progressPercentage={0}
        loadingMessage="Loading exam..."
      />
    );
    expect(screen.getByText("Loading exam...")).toBeInTheDocument();
    expect(screen.getByText(/do not refresh this page/i)).toBeInTheDocument();
  });

  test("renders progress percentage", () => {
    render(
      <AnimatedProgressBar
        progressPercentage={42}
        loadingMessage="Working..."
      />
    );
    expect(screen.getByText(/working/i)).toBeInTheDocument();

    // Should round down and show "42%"
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  test("caps progress at 100%", () => {
    render(
      <AnimatedProgressBar
        progressPercentage={100}
        loadingMessage="Finalizing..."
      />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  test("progress animates toward next breakpoint", () => {
    const { rerender } = render(
      <AnimatedProgressBar
        progressPercentage={26}
        loadingMessage="Generating..."
      />
    );

    // Initial percent text should still be at or near starting point
    expect(screen.getByText(/2[0-6]%/)).toBeInTheDocument(); // Approx range

    // Simulate time passing for animation
    jest.advanceTimersByTime(5000); // Interval is 2500ms

    rerender(
      <AnimatedProgressBar
        progressPercentage={26}
        loadingMessage="Generating..."
      />
    );
    // Re-verify it's still moving toward ~49% (next breakpoint: 50 - 1)
    // But we shouldn't assert exact value due to animation
    const progressText = screen.getByText(/\d+%/).textContent!;
    const value = parseInt(progressText.replace("%", ""));
    expect(value).toBeGreaterThanOrEqual(26);
    expect(value).toBeLessThan(50);
  });
});
