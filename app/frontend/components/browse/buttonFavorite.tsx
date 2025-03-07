import { useState } from 'react';

export default function Favorite() {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation(); 
        setIsFavorite(!isFavorite);
    };

    return (
        <div
            className="absolute z-10 top-3 right-3 cursor-pointer"
            onClick={handleClick}
        >
            <span className={`material-icons ${isFavorite ? "text-red-400" : "text-zinc-200 hover:text-white"}`}>
                {isFavorite ? "favorite" : "favorite_border"}
            </span>
        </div>
    );
}