interface InputFieldProps {
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    textarea?: boolean;
  }
  
  export default function InputField({
    label,
    type = "text",
    value, 
    onChange,
    placeholder
  }: InputFieldProps) {
    // Create an ID based on the label (if provided)
    const inputId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;
  
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className="w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
      </div>
    );
  }
  