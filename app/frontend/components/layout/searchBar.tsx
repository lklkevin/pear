export default function SearchBar() {
    return (
      <div className="flex items-center space-x-3 bg-zinc-800 pl-3 rounded-md w-full max-w-lg border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500">
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent text-white outline-none flex-grow"
        />
        <button className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700">
          ⚙️ {/* Replace with an icon */}
        </button>
      </div>
    );
  }
  