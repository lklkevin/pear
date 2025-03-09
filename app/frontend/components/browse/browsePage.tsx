import { useState, useEffect } from "react";
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
  const limit = 16; // Number of items per page

  const fetchExams = async () => {
    if (status === "loading") return;

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
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

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
      setResults(data);
      // If we received a full page of items, assume there could be more.
      setHasMore(data.length === limit);
    } catch (error) {
      useErrorStore.getState().setError(error as string);
    }
  };

  // Fetch exams when the page, activeTab, searchTerm, or status changes.
  useEffect(() => {
    if (status === "loading") return;
    fetchExams();
  }, [page, activeTab, status, searchTerm]);

  // Reset search and pagination when the active tab changes.
  useEffect(() => {
    if (status === "loading") return;
    setSearchQuery("");
    setSearchTerm("");
    setPage(1);
  }, [activeTab, status]);

  // When the user triggers a search, update the search term and reset to page 1.
  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchQuery);
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
      <div className="flex-1 flex flex-col justify-between h-full">
        {results.length === 0 ? (
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
