/**
 * Props for the SubmitButton component
 * @interface SubmitButtonProps
 * @property {string} text - Text to display on the button
 * @property {boolean} loading - Whether the button is in a loading state
 */
interface SubmitButtonProps {
    text: string;
    loading: boolean;
}

/**
 * Reusable submit button component for forms
 * Shows loading state and prevents multiple submissions while loading
 * 
 * @param {SubmitButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered submit button with loading state handling
 */
export default function SubmitButton({
    text,
    loading,
  }: SubmitButtonProps) {
    return (
      <button
        type="submit"
        className={`select-none w-full font-medium bg-zinc-200 text-black py-[9px] rounded-md hover:bg-zinc-50 transition !mt-8
        ${loading ? "opacity-50 cursor-not-allowed hover:bg-zinc-100" : ""}`}
        disabled={loading}
        >
          {loading ? text: text}
      </button>
    );
  }