/**
 * Props for the Button component
 * @interface ButtonProps
 * @property {string} text - Text to display on the button
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {() => void} [onClick] - Click handler function
 */
interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Gray-themed button component
 * Features:
 * - Rounded-full design
 * - Hover effects
 * - Disabled state styling
 * - Smooth transitions
 * 
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Styled button element
 */
export default function Button({
  text,
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`select-none text-sm tracking-tight font-semibold h-8 w-24 rounded-full transition-all duration-200
        ${disabled 
          ? "cursor-not-allowed" 
          : "text-white bg-zinc-950 border-zinc-700 border hover:bg-zinc-700 hover:text-white"}
      `}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
    >
      {text}
    </button>
  );
}
  