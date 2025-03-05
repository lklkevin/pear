interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
}

export default function InputField({ label, value, onChange, placeholder, textarea }: InputFieldProps) {
  const inputId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;

  return (
    <div className="flex">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      {textarea ? (
        <textarea
          id={inputId}
          className="resize-none w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={4}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}