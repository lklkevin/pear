import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrowsePage from "../browsePage";

// Simulate an authenticated session so that all tabs are available.
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "John Doe" }, accessToken: "abc" },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({}),
}));

// Mock BrowseLayout to isolate the component.
jest.mock(
  "../../layout/browseLayout",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="browse-layout">{children}</div>
);

// Mock Tabs to allow switching active tabs.
jest.mock(
  "../../ui/tabs",
  () =>
    ({
      activeTab,
      setActiveTab,
    }: {
      activeTab: string;
      setActiveTab: (tab: string) => void;
    }) =>
      (
        <div data-testid="tabs">
          <button onClick={() => setActiveTab("My Exams")}>My Exams</button>
          <button onClick={() => setActiveTab("Popular")}>Popular</button>
          <button onClick={() => setActiveTab("Favorites")}>Favorites</button>
          <button onClick={() => setActiveTab("Explore")}>Explore</button>
        </div>
      )
);

// Mock SearchBar.
jest.mock("../../ui/searchBar", () => () => (
  <div data-testid="search-bar">SearchBar</div>
));

// Mock ExamGrid to display the number of exams.
jest.mock(
  "../examGrid",
  () =>
    ({
      exams,
    }: {
      exams: { color: string; title: string; author: string }[];
    }) =>
      <div data-testid="exam-grid">{exams.length} exams</div>
);

// Before each test, mock global.fetch to return an array of 4 exam objects.
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { color: "#fff", title: "Exam 1", author: "John Doe" },
          { color: "#fff", title: "Exam 2", author: "John Doe" },
          { color: "#fff", title: "Exam 3", author: "John Doe" },
          { color: "#fff", title: "Exam 4", author: "John Doe" },
        ]),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("BrowsePage component", () => {
  test("renders correctly with the default active tab", async () => {
    render(<BrowsePage />);

    // For an authenticated session, availableTabs = ["Popular", "Explore", "My Exams", "Favorites"]
    // Default active tab is "Popular" so the heading should be "Popular Exams"
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /popular exams/i })
      ).toBeInTheDocument();
    });

    // Ensure the search bar and tab navigation are present.
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("tabs")).toBeInTheDocument();

    // ExamGrid should render with 4 exams (from our fetch mock)
    await waitFor(() => {
      expect(screen.getByTestId("exam-grid")).toHaveTextContent("4 exams");
    });
  });

  test("changes the active tab when a tab button is clicked", async () => {
    render(<BrowsePage />);

    // Click on the "My Exams" tab button.
    fireEvent.click(screen.getByText(/my exams/i));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /my exams/i })
      ).toBeInTheDocument();
    });

    // Click on the "Favorites" tab button.
    fireEvent.click(screen.getByText(/favorites/i));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /my favorites/i })
      ).toBeInTheDocument();
    });
  });

  test("displays the correct number of exams in ExamGrid", async () => {
    render(<BrowsePage />);
    await waitFor(() => {
      expect(screen.getByTestId("exam-grid")).toHaveTextContent("4 exams");
    });
  });
});
