import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import BrowseLayout from "../layout/browseLayout";
import Tabs from "../ui/tabs";
import SearchBar from "../ui/searchBar";
import ExamGrid from "./examGrid";
import InfiniteScroll from "react-infinite-scroll-component";
import { useErrorStore } from "@/store/store";

export default function BrowsePage() {
  const { data: session, status } = useSession();

  // Only allow "Popular" and "Explore" tabs for unauthenticated users.
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

  const fetchExams = async (reset = false, overrideSearch?: string) => {
    // Guard: if session status is still loading, don't fetch.
    if (status === "loading") return;

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let endpoint = "";
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    const pageToFetch = reset ? 1 : page;
    params.append("page", pageToFetch.toString());
    const queryTitle = overrideSearch !== undefined ? overrideSearch : searchQuery;
    params.append("title", queryTitle);

    // If authenticated, use the personal endpoint for all tabs so that extra data (e.g. is_liked) is provided.
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
      // Unauthenticated visitors can only access the public endpoint.
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
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Attach the token if the user is authenticated.
    if (session) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.accessToken}`,
      };
    }

    try {
      const res = await fetch(url, fetchOptions);
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      const data = await res.json();
      if (reset) {
        setResults(data);
        setPage(2);
      } else {
        setResults((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
      setHasMore(data.length === limit);
    } catch (error) {
      useErrorStore.getState().setError(error as string);
    }
  };

  // When activeTab or session status changes, reset the search and results.
  useEffect(() => {
    if (status === "loading") return; // Wait until the session is ready.
    setSearchQuery("");
    setPage(1);
    setResults([]);
    setHasMore(true);
    fetchExams(true, "");
  }, [activeTab, status]);

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
