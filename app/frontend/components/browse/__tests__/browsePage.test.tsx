import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrowsePage from "../browsePage";

// Create mockRouter with mock functions that we can control
const mockRouterPush = jest.fn();
const mockRouter = {
  query: { tab: "Popular", page: "1" },
  isReady: true,
  pathname: "/browse",
  push: mockRouterPush,
};

// Simulate an authenticated session so that all tabs are available.
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "John Doe" }, accessToken: "abc" },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({}),
}));

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
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
      tabs,
      className,
    }: {
      activeTab: string;
      setActiveTab: (tab: string) => void;
      tabs: string[];
      className?: string;
    }) =>
      (
        <div data-testid="tabs" className={className}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      )
);

// Mock SearchBar with proper props
jest.mock(
  "../../ui/searchBar",
  () =>
    ({ placeholder, value, onChange, onSearch }: any) =>
      (
        <div data-testid="search-bar">
          <input
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            data-testid="search-input"
          />
          <button onClick={onSearch} data-testid="search-button">
            Search
          </button>
        </div>
      )
);

// Mock ExamGrid to display the number of exams.
jest.mock("../examGrid", () => ({ exams }: { exams: any[] }) => (
  <div data-testid="exam-grid">{exams.length} exams</div>
));

// Mock Skeleton
jest.mock("../../ui/skeleton", () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = "http://test-api";

// Before each test, reset mocks and set default router state
beforeEach(() => {
  jest.clearAllMocks();

  // Reset router to default state
  mockRouter.query = { tab: "Popular", page: "1" };

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          Array(12).fill({ color: "#fff", title: "Exam", author: "John Doe" })
        ),
    })
  ) as jest.Mock;
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
      expect(screen.getByTestId("exam-grid")).toHaveTextContent("12 exams");
    });

    // Verify the proper fetch call was made
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "http://test-api/api/browse/personal?limit=12&page=1&sorting=popular"
      ),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer abc",
        }),
      })
    );
  });

  test("changes the active tab when a tab button is clicked", async () => {
    render(<BrowsePage />);

    // Click on the "My Exams" tab button
    fireEvent.click(screen.getByText(/my exams/i));

    // Verify router.push was called with the correct parameters
    expect(mockRouterPush).toHaveBeenCalledWith(
      {
        pathname: "/browse",
        query: { tab: "My Exams", page: "1" },
      },
      undefined,
      { shallow: true }
    );
  });

  test("handles search queries correctly", async () => {
    render(<BrowsePage />);

    // Type in the search input
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    // Click search button
    fireEvent.click(screen.getByTestId("search-button"));

    // Verify router.push was called with the correct parameters
    expect(mockRouterPush).toHaveBeenCalledWith(
      {
        pathname: "/browse",
        query: { tab: "Popular", page: "1", search: "test search" },
      },
      undefined,
      { shallow: true }
    );
  });

  test("displays the correct number of exams in ExamGrid", async () => {
    render(<BrowsePage />);
    await waitFor(() => {
      expect(screen.getByTestId("exam-grid")).toHaveTextContent("12 exams");
    });
  });

  test("handles pagination correctly", async () => {
    render(<BrowsePage />);

    // Wait for the component to render and initial data to load
    await waitFor(() => {
      expect(screen.getByTestId("exam-grid")).toHaveTextContent("12 exams");
    });

    // Find the pagination buttons
    const nextButton = screen.getByLabelText("Next page");

    // Clear the mock to ensure we only see calls from the button click
    mockRouterPush.mockClear();

    // Test next page button
    fireEvent.click(nextButton);

    // Check if mockRouterPush was called with the right parameters
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        {
          pathname: "/browse",
          query: { tab: "Popular", page: "2" },
        },
        undefined,
        { shallow: true }
      );
    });
  });
});
