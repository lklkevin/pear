export default function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <span className="material-icons absolute left-3 top-2.5 text-zinc-400">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-700"
      />
    </div>
  );
}
