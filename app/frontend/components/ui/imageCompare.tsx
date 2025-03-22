"use client";

import { useState, useRef, useEffect } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export default function ImageComparison({
  beforeImage,
  afterImage,
  beforeAlt = "Before image",
  afterAlt = "After image",
  className = "",
}: ImageComparisonProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;

      // Calculate position as percentage
      const newPosition = Math.min(
        Math.max((x / containerWidth) * 100, 0),
        100
      );
      setPosition(newPosition);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Fallback images if needed
  const placeholderBefore =
    "https://placehold.co/600x400/333333/FFFFFF/png?text=Before";
  const placeholderAfter =
    "https://placehold.co/600x400/444444/FFFFFF/png?text=After";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden rounded-lg sm:rounded-xl ${className}`}
    >
      {/* After image (bottom layer, full width) */}
      <img
        src={afterImage || placeholderAfter}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = placeholderAfter;
        }}
      />

      {/* Before image (top layer, clipped) */}
      <div className="absolute inset-0 h-full overflow-hidden w-full">
        <img
          src={beforeImage || placeholderBefore}
          alt={beforeAlt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
          onError={(e) => {
            e.currentTarget.src = placeholderBefore;
          }}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
        style={{ left: `calc(${position}% - 0.5px)` }}
        onMouseDown={handleMouseDown}
      >
        {/* Drag handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize">
          <div className="flex items-center gap-1">
            <div className="w-0.5 h-5 bg-zinc-800"></div>
            <div className="w-0.5 h-5 bg-zinc-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
