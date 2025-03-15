import { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useErrorStore } from "@/store/store";

interface FavoriteProps {
  examId: number;
  initialFavorite: boolean;
}

export default function Favorite({ examId, initialFavorite }: FavoriteProps) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return null;
  }

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Prevent spamming while a request is in progress.
    if (isLoading) return;
    setIsLoading(true);

    // Determine the new state and set the corresponding action.
    const newFavoriteState = !isFavorite;
    const result = {
      exam_id: examId,
      action: newFavoriteState ? "fav" : "unfav",
    };

    try {
      const currSession = await getSession();
      const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/favourite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currSession?.accessToken}`,
          },
          body: JSON.stringify(result),
        }
      );

      const res = await saveResponse.json();

      if (!saveResponse.ok) {
        useErrorStore.getState().setError("Failed to update favorite status");
      } else if (res.error) {
        useErrorStore.getState().setError(res.error);
      } else {
        setIsFavorite(newFavoriteState);
      }
    } catch (error) {
      useErrorStore.getState().setError("Failed to update favorite status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="absolute z-10 top-3 right-3 cursor-pointer"
      onClick={handleClick}
    >
      <span
        className={`drop-shadow-sm material-icons ${
          isFavorite ? "text-white" : "text-zinc-300 hover:text-white"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isFavorite ? "favorite" : "favorite_border"}
      </span>
    </div>
  );
}
