export default function Button({
    text,
    disabled,
    onClick,
  }: {
    text: string;
    disabled?: boolean;
    onClick?: () => void;
  }) {
    return (
      <button
        className={`text-sm font-semibold h-8 w-24 rounded-md transition-all duration-200 tracking-tight
          ${disabled 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-zinc-950 border-zinc-700 border hover:bg-zinc-700 hover:text-white"}
        `}
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
      >
        {text}
      </button>
    );
  }
  