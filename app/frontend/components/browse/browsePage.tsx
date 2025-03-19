import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import BrowseLayout from "../layout/browseLayout";
import Tabs from "../ui/tabs";
import SearchBar from "../ui/searchBar";
import ExamGrid from "./examGrid";
import { useErrorStore } from "@/store/store";
import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "500",
});

export default function BrowsePage() {
  const { data: session, status } = useSession();
  // Track the latest request to handle out-of-order responses
  const latestRequestId = useRef(0);
  // Keep track of abort controller for canceling previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Only allow "Popular" and "Explore" tabs for unauthenticated users.
  const availableTabs = session
    ? ["Popular", "Explore", "My Exams", "Favorites"]
    : ["Popular", "Explore"];

  // States for active tab, search query, current search term (for fetching), fetched results, pagination, and loading.
  const [activeTab, setActiveTab] = useState(availableTabs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 12; // Number of items per page

  // Function to build fetch URL and options
  const buildFetchParams = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let endpoint = "";
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("page", page.toString());
    params.append("title", searchTerm);

    if (session) {
      endpoint = `${baseUrl}/api/browse/personal`;
      if (activeTab === "Popular") {
        params.append("sorting", "popular");
      } else if (activeTab === "Explore") {
        params.append("sorting", "recent");
      } else if (activeTab === "My Exams") {
        params.append("filter", "mine");
      } else if (activeTab === "Favorites") {
        params.append("filter", "favourites");
      }
    } else {
      endpoint = `${baseUrl}/api/browse`;
      if (activeTab === "Popular") {
        params.append("sorting", "popular");
      } else if (activeTab === "Explore") {
        params.append("sorting", "recent");
      }
    }

    const url = `${endpoint}?${params.toString()}`;

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortControllerRef.current.signal,
    };

    if (session) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.accessToken}`,
      };
    }

    return { url, fetchOptions };
  }, [activeTab, page, searchTerm]);

  // Fetch exams - separate from state effects
  const fetchExams = useCallback(async () => {
    // Increment the request ID for this specific request
    const currentRequestId = ++latestRequestId.current;

    setIsLoading(true);

    try {
      const { url, fetchOptions } = buildFetchParams();
      const response = await fetch(url, fetchOptions);

      // Check if this response is for the latest request
      // If not, ignore the response to prevent state updates with stale data
      if (currentRequestId !== latestRequestId.current) {
        return;
      }

      const data = await response.json();

      if (!response.ok || data?.message) {
        useErrorStore
          .getState()
          .setError(data?.message || "Error fetching exams");
        return;
      }

      // Double-check that this is still the latest request before updating state
      if (currentRequestId === latestRequestId.current) {
        setResults(data);
        // If we received a full page of items, assume there could be more
        setHasMore(data.length === limit);
      }
    } catch (error) {
      // Only handle errors for the current request
      // AbortError is expected when a request is canceled, so we don't treat it as an error
      if (
        currentRequestId === latestRequestId.current &&
        !(error instanceof DOMException && error.name === "AbortError")
      ) {
        useErrorStore.getState().setError(error as string);
      }
    } finally {
      // Only update loading state for the current request
      if (currentRequestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [buildFetchParams]);

  // Clean up any pending requests when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle tab changes - always reset search and page, then fetch
  const handleTabChange = useCallback((tab: React.SetStateAction<string>) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSearchTerm("");
    setPage(1);
  }, []);

  // Handle search - reset page and update search term
  const handleSearch = useCallback(() => {
    setPage(1);
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  // Unified effect for fetching data when dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchExams();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchExams]);

  const tabTitles: { [key: string]: string } = {
    "My Exams": "My Exams",
    Popular: "Popular Exams",
    Favorites: "My Favorites",
    Explore: "Explore Exams",
  };

  if (status === "loading") {
    return (
      <BrowseLayout>
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="drop-shadow-xl h-12 w-12 rounded-full border-4 border-emerald-600 border-t-white animate-spin"></div>
          <p className="text-lg font-medium text-white mt-4">Loading...</p>
        </div>
      </BrowseLayout>
    );
  }

  return (
    <BrowseLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sm:gap-8">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight min-w-[200px] md:min-w-[330px]">
          {tabTitles[activeTab] || "Popular"}
        </h1>
        <div className="mt-1 w-full md:w-auto md:flex-1 md:max-w-[550px] min-w-[250px]">
          <SearchBar
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>
      <div className="mt-6">
        <Tabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          className="text-md gap-6"
          tabs={availableTabs}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between h-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="drop-shadow-xl h-12 w-12 rounded-full border-4 border-emerald-600 border-t-white animate-spin"></div>
            <p className="text-lg font-medium text-white mt-4">Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-zinc-400 text-lg mt-10">
            No exams found. Try a different search.
          </div>
        ) : (
          <>
            <ExamGrid exams={results} />
          </>
        )}
        <div className="justify-center flex items-center gap-3 w-full mt-4 sm:mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex items-center justify-center w-9 h-9 border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-950"
          >
            <span className="material-icons text-zinc-400">chevron_left</span>
          </button>

          <div
            className={`sm:text-lg ${dmMono.className} bg-zinc-900 w-16 h-9 px-2 border border-zinc-800 rounded text-center text-white flex items-center justify-center`}
          >
            {page}
          </div>

          <button
            onClick={() => setPage((prev) => (hasMore ? prev + 1 : prev))}
            disabled={!hasMore}
            aria-label="Next page"
            className="flex items-center justify-center w-9 h-9 border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-950"
          >
            <span className="material-icons text-zinc-400">chevron_right</span>
          </button>
        </div>
      </div>
    </BrowseLayout>
  );
}
