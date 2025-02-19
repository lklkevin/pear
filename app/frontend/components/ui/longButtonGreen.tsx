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
        className={`font-semibold p-2 w-full rounded-md transition-all duration-200 tracking-normal
          ${disabled 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-emerald-900 border-emerald-400 border hover:bg-emerald-800 hover:text-white"}
        `}
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
      >
        {text}
      </button>
    );
  }
  