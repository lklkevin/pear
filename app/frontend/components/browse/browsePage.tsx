import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import BrowseLayout from "../layout/browseLayout";
import Tabs from "../ui/tabs";
import SearchBar from "../ui/searchBar";
import ExamGrid from "./examGrid";
import InfiniteScroll from "react-infinite-scroll-component";
import { useErrorStore } from "@/store/store";

export default function BrowsePage() {
  const { data: session } = useSession();
  // Show "My Exams" and "Favorites" only if logged in.
  const availableTabs = session
    ? ["Popular", "Explore", "My Exams", "Favorites"]
    : ["Popular", "Explore"];

  // States for active tab, search query, fetched results, pagination, and loading.
  const [activeTab, setActiveTab] = useState(availableTabs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 10; // Number of items per page

  // Fetch exams based on active tab, current page, and search query.
  // Optionally, an override for the search term can be provided.
  const fetchExams = async (
    reset: boolean = false,
    overrideSearch?: string
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let endpoint = "";
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    // Determine which page to fetch
    const pageToFetch = reset ? 1 : page;
    params.append("page", pageToFetch.toString());
    // Use overrideSearch if provided; otherwise, use the current searchQuery.
    const queryTitle =
      overrideSearch !== undefined ? overrideSearch : searchQuery;
    params.append("title", queryTitle);

    if (activeTab === "Popular") {
      endpoint = `${baseUrl}/api/browse`;
      params.append("sorting", "popular");
    } else if (activeTab === "Explore") {
      endpoint = `${baseUrl}/api/browse`;
      params.append("sorting", "recent");
    } else if (activeTab === "My Exams") {
      endpoint = `${baseUrl}/api/browse/personal`;
      params.append("filter", "mine");
    } else if (activeTab === "Favorites") {
      endpoint = `${baseUrl}/api/browse/personal`;
      params.append("filter", "favourites");
    }

    const url = `${endpoint}?${params.toString()}`;

    // Prepare fetch options and attach bearer token if calling the personal endpoint.
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Only add Authorization header if we're calling the personal endpoints.
    if (activeTab === "My Exams" || activeTab === "Favorites") {
      const currSession = await getSession();
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${currSession?.accessToken}`,
      };
    }

    try {
      const res = await fetch(url, fetchOptions);
      const data = await res.json();
      if (reset) {
        setResults(data);
        setPage(2);
      } else {
        setResults((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
      // If fewer items than the limit are returned, there is no more data.
      setHasMore(data.length === limit);
    } catch (error) {
      useErrorStore.getState().setError(error as string);
    }
  };

  // When activeTab changes, clear the search query immediately and fetch with an empty title.
  useEffect(() => {
    setSearchQuery(""); // Clear search bar immediately.
    setPage(1);
    setResults([]);
    setHasMore(true);
    fetchExams(true, "");
  }, [activeTab]);

  // Trigger search when the search icon is clicked or the user presses Enter.
  const handleSearch = () => {
    setPage(1);
    setResults([]);
    setHasMore(true);
    fetchExams(true);
  };

  const tabTitles: { [key: string]: string } = {
    "My Exams": "My Exams",
    Popular: "Popular Exams",
    Favorites: "My Favorites",
    Explore: "Explore Exams",
  };

  return (
    <BrowseLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sm:gap-8">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight min-w-[200px] md:min-w-[330px]">
          {tabTitles[activeTab] || "Popular"}
        </h1>
        <div className="mt-1 w-full md:w-auto md:flex-1 md:max-w-[550px] min-w-[250px] md:mb-0 mb-0">
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
          setActiveTab={setActiveTab}
          className="text-md gap-6"
          tabs={availableTabs}
        />
      </div>
      {results.length === 0 && !hasMore ? (
        <div className="text-center text-zinc-400 text-lg mt-10">
          No exams found. Try a different search.
        </div>
      ) : (
        <InfiniteScroll
          dataLength={results.length}
          next={() => fetchExams()}
          hasMore={hasMore}
          loader={
            <div className="flex flex-col items-center gap-2">
              <div className="drop-shadow-xl h-12 w-12 rounded-full border-4 border-emerald-600 border-t-white animate-spin mb-4"></div>
              <p className="text-lg font-medium text-white">Loading...</p>
            </div>
          }
        >
          <ExamGrid exams={results} />
        </InfiniteScroll>
      )}
    </BrowseLayout>
  );
}
