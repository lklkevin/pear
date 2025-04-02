import { useState, useId } from "react";
import InputField from "./inputField";

/**
 * Props for the PasswordField component
 * @interface PasswordFieldProps
 * @property {string} [id] - Optional ID for the input element, auto-generated if not provided
 * @property {string} label - Label text for the password field
 * @property {string} value - Current value of the password field
 * @property {Function} onChange - Callback function for handling input changes
 * @property {boolean} [showForgotPassword=false] - If true, shows a "Forgot Password?" link
 * @property {Function} [onForgotPasswordClick] - Callback function for when the forgot password link is clicked
 */
interface PasswordFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showForgotPassword?: boolean;
  onForgotPasswordClick?: () => void;
}

/**
 * Password input field component with show/hide password toggle functionality
 * Optionally displays a "Forgot Password?" link if specified
 * 
 * @param {PasswordFieldProps} props - Component props
 * @returns {JSX.Element} - Rendered password input with label and toggle visibility button
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  showForgotPassword = false,
  onForgotPasswordClick,
}: PasswordFieldProps) {
  const autoId = useId();
  const inputId = id || autoId
  // State to track password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label
        htmlFor={inputId}
        className="flex justify-between font-medium text-zinc-300"
      >
        {label}
        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-zinc-300 underline"
          >
            Forgot Password?
          </button>
        )}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          className="text-white w-full p-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500 pr-10" // Add padding-right for button space
          value={value}
          onChange={onChange}
          required
          maxLength={100}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="select-none absolute inset-y-0 right-3 top-1 flex items-center text-zinc-400 hover:text-zinc-200"
        >
          <span className="material-icons scale-90">
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </button>
      </div>
    </div>
  );
}
