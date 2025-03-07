interface SubmitButtonProps {
    text: string;
    loading: boolean;
}

export default function SubmitButton({
    text,
    loading,
  }: SubmitButtonProps) {
    return (
      <button
        type="submit"
        className={`w-full bg-zinc-200 text-black py-2 rounded-md hover:bg-zinc-50 transition !mt-8
        ${loading ? "opacity-50 cursor-not-allowed hover:bg-zinc-100" : ""}`}
        disabled={loading}
        >
          {loading ? text: text}
      </button>
    );
  }