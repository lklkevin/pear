interface InputFieldProps {
    label: string;
    type?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({
    label,
    type = "text",
    value, 
    onChange
}: InputFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-300">{label}</label>
            <input
                type={type}
                className="w-full p-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-500"
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );
}