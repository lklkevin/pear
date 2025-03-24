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
        className={`text-sm font-semibold h-8 w-24 rounded-full transition-all duration-200 tracking-tight
          ${disabled 
            ? "bg-gray-400 cursor-not-allowed" 
            : "text-white bg-emerald-900 border-emerald-400 border hover:bg-emerald-800 hover:text-white"}
        `}
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
      >
        {text}
      </button>
    );
  }
  