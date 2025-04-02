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
 * Green-themed button component
 * Features:
 * - Rounded-full design
 * - Emerald color scheme
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
      className={`select-none text-sm font-semibold h-8 w-24 rounded-full transition-all duration-200 tracking-tight
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
  