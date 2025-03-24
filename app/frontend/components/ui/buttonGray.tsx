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
        className={`text-sm tracking-tight font-semibold h-8 w-24 rounded-full transition-all duration-200
          ${disabled 
            ? "cursor-not-allowed" 
            : "bg-zinc-950 border-zinc-700 border hover:bg-zinc-700 hover:text-white"}
        `}
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
      >
        {text}
      </button>
    );
  }
  