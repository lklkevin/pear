import { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useErrorStore } from "@/store/store";

/**
 * Props for the Favorite button component
 * @interface FavoriteProps
 * @property {number} examId - The ID of the exam to favorite/unfavorite
 * @property {boolean} initialFavorite - The initial favorite state of the exam
 */
interface FavoriteProps {
  examId: number;
  initialFavorite: boolean;
}

/**
 * Favorite button component for toggling exam favorite status
 * Shows filled or outlined heart icon based on favorite state
 * Only visible to authenticated users
 * 
 * @param {FavoriteProps} props - Component props
 * @returns {JSX.Element | null} - Rendered favorite button or null if user is not authenticated
 */
export default function Favorite({ examId, initialFavorite }: FavoriteProps) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return null;
  }

  /**
   * Handles clicking the favorite button
   * Toggles the favorite state and sends API request to update
   * Provides optimistic UI updates with fallback on error
   * 
   * @param {React.MouseEvent} event - Click event
   */
  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Prevent spamming while a request is in progress.
    if (isLoading) return;
    setIsLoading(true);

    // Determine the new state and set the corresponding action.
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
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
        setIsFavorite(!newFavoriteState);
        useErrorStore.getState().setError("Failed to update favorite status");
      } else if (res.error) {
        setIsFavorite(!newFavoriteState);
        useErrorStore.getState().setError(res.error);
      }
    } catch (error) {
      setIsFavorite(!newFavoriteState);
      useErrorStore.getState().setError("Failed to update favorite status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="absolute z-10 top-3 right-3 select-none cursor-pointer"
      onClick={handleClick}
    >
      <span
        className={`drop-shadow-sm material-icons ${
          isFavorite ? "text-white" : "text-zinc-300 hover:text-white"
        }`}
      >
        {isFavorite ? "favorite" : "favorite_border"}
      </span>
    </div>
  );
}
