interface SubmitButtonProps {
    text: string;
    loading: any;
}

export default function SubmitButton({
    text,
    loading,
  }: SubmitButtonProps) {
    return (
      <button
        type="submit"
        className="w-full bg-zinc-100 text-black py-2 rounded-md hover:bg-zinc-300 transition !mt-8"
        disabled={loading}
        >
          {loading ? "Signing up..." : text}
      </button>
    );
  }