import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import BrowseLayout from "../layout/browseLayout";
import Tabs from "../ui/tabs";
import SearchBar from "../ui/searchBar";
import ExamGrid from "./examGrid";
import { useErrorStore } from "@/store/store";
import { DM_Mono } from "next/font/google";
import { Skeleton } from "../ui/skeleton";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "500",
});

export default function BrowsePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Only allow these tabs for the user (depending on auth status)
  const availableTabs = session
    ? ["Popular", "Explore", "My Exams", "Favorites"]
    : ["Popular", "Explore"];

  // Default constants
  const DEFAULT_TAB = availableTabs[0];
  const DEFAULT_PAGE = 1;
  const DEFAULT_SEARCH = "";
  const LIMIT = 12; // Items per page

  // Local state for fetched results and loading
  const [results, setResults] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Get values from URL query or fall back to defaults.
  const activeTab =
    typeof router.query.tab === "string" ? router.query.tab : DEFAULT_TAB;
  const page = router.query.page
    ? parseInt(router.query.page as string)
    : DEFAULT_PAGE;
  const searchQuery =
    typeof router.query.search === "string"
      ? router.query.search
      : DEFAULT_SEARCH;

  // Helper to update URL parameters.
  const updateUrlParams = useCallback(
    (params: { tab?: string; page?: number; search?: string }) => {
      const newQuery = { ...router.query };
      if (params.tab !== undefined) {
        newQuery.tab = params.tab;
      }
      if (params.page !== undefined) {
        newQuery.page = params.page.toString();
      }
      if (params.search !== undefined) {
        if (params.search === DEFAULT_SEARCH) {
          delete newQuery.search;
        } else {
          newQuery.search = params.search;
        }
      }
      router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  // Handle tab changes
  const handleTabChange = useCallback(
    (value: React.SetStateAction<string>) => {
      // If the value is a function, call it with the current activeTab; otherwise, use it directly.
      const newTab = typeof value === "function" ? value(activeTab) : value;
      if (!availableTabs.includes(newTab)) return;
      updateUrlParams({
        tab: newTab,
        page: DEFAULT_PAGE,
        search: DEFAULT_SEARCH,
      });
    },
    [availableTabs, activeTab, updateUrlParams]
  );

  // Handle page changes.
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateUrlParams({ tab: activeTab, page: newPage });
    },
    [activeTab, updateUrlParams]
  );

  // Build the fetch URL and options.
  const buildFetchParams = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let endpoint = "";
    const params = new URLSearchParams();
    params.append("limit", LIMIT.toString());
    params.append("page", page.toString());

    if (searchQuery) {
      params.append("title", searchQuery);
    }

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
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    if (session) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.accessToken}`,
      };
    }
    return { url, fetchOptions };
  }, [activeTab, page, searchQuery, status]);

  // Fetch exams from the backend.
  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const { url, fetchOptions } = buildFetchParams();
      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      if (!response.ok || data?.message) {
        useErrorStore
          .getState()
          .setError(data?.message || "Error fetching exams");
        return;
      }
      setResults(data);
      // If we got a full page, assume there may be more.
      setHasMore(data.length === LIMIT);
    } catch (error) {
      useErrorStore.getState().setError(error as string);
    } finally {
      setIsLoading(false);
    }
  }, [buildFetchParams, status]);

  // Fetch data when router query parameters or session status change.
  useEffect(() => {
    if (!router.isReady || status === "loading") return;

    // Set loading state immediately
    setIsLoading(true);

    // Validate the active tab.
    if (!availableTabs.includes(activeTab)) {
      handleTabChange(DEFAULT_TAB);
      return;
    }

    fetchExams();
  }, [router.isReady, status, router.query, fetchExams]);

  const tabTitles: { [key: string]: string } = {
    "My Exams": "My Exams",
    Popular: "Popular Exams",
    Favorites: "My Favorites",
    Explore: "Explore Exams",
  };

  // Local state for the search input (to control the input field).
  const [inputSearchQuery, setInputSearchQuery] = useState(searchQuery);

  // Keep the search input in sync with the URL query.
  useEffect(() => {
    setInputSearchQuery(searchQuery);
  }, [searchQuery]);

  if (status === "loading") {
    return (
      <BrowseLayout>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sm:gap-8">
          <Skeleton className="h-[2.25rem] sm:h-[3rem] w-2/3 sm:min-w-[200px] md:w-[330px]" />
          <Skeleton className="mt-1 h-[42px] w-full md:w-auto md:flex-1 md:max-w-[550px] min-w-[250px]" />
        </div>
        <Skeleton className="mt-6 h-[31px] w-full" />
        <div className="flex-1 flex flex-col justify-between h-full">
          <ExamGrid exams={[]} />
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
            value={inputSearchQuery}
            onChange={(e) => setInputSearchQuery(e.target.value)}
            onSearch={() =>
              updateUrlParams({
                tab: activeTab,
                search: inputSearchQuery,
                page: DEFAULT_PAGE,
              })
            }
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
          <ExamGrid exams={[]} />
        ) : results.length === 0 ? (
          <div className="text-center text-zinc-400 text-lg mt-10">
            No exams found. Try a different search.
          </div>
        ) : (
          <ExamGrid exams={results} />
        )}
        <div className="justify-center flex items-center gap-3 w-full mt-4 sm:mt-8">
          <button
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1 || isLoading}
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
            onClick={() => handlePageChange(hasMore ? page + 1 : page)}
            disabled={!hasMore || isLoading}
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
