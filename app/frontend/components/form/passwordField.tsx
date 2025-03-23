import { useState } from "react";
import InputField from "./inputField";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showForgotPassword?: boolean;
  onForgotPasswordClick?: () => void;
}

export default function PasswordField({
  label,
  value,
  onChange,
  showForgotPassword = false,
  onForgotPasswordClick,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <label className="flex justify-between font-medium text-zinc-300">
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
          type={showPassword ? "text" : "password"}
          className="w-full p-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500 pr-10" // Add padding-right for button space
          value={value}
          onChange={onChange}
          required
          maxLength={100}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 top-1 flex items-center text-zinc-400 hover:text-zinc-200"
        >
          <span className="material-icons scale-90">
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </button>
      </div>
    </div>
  ); 
}
