import { useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";

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
      <label className="flex justify-between text-sm font-medium text-zinc-300">
        {label}
        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-white underline"
          >
            Forgot Password?
          </button>
        )}
      </label>
      <input
        type={showPassword ? "text" : "password"}
        className="w-full p-2 mt-1 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        className="mr-1 absolute right-3 top-9 text-zinc-400 hover:text-zinc-200"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div>
  );
}
