interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  textarea?: boolean;
  auth?: boolean;
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  auth,
}: InputFieldProps) {
  const inputId = label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;

  return (
    <div className="flex flex-col">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-medium text-zinc-300"
        >
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
          maxLength={1000}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          className={`${
            auth ? "mt-1" : ""
          } w-full py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={100}
        />
      )}
    </div>
  );
}
