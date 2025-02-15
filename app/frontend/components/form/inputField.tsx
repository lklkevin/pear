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
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-300">{label}</label>
            <input
                type={type}
                className="w-full p-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );
}