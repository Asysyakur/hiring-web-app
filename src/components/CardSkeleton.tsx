import React from "react";

const CardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-end justify-between gap-4 p-8 rounded-lg bg-gray-100 animate-pulse shadow-lg w-full"
    >
      <div className="flex-1 flex flex-col gap-8" aria-hidden>
        <div className="h-3 rounded-md bg-gray-200 animate-pulse w-1/4" />
        <div className="h-3 rounded-md bg-gray-200 animate-pulse w-3/5" />
        <div className="h-3 rounded-md bg-gray-200 animate-pulse w-2/5" />
      </div>

      <div className="flex items-end flex-shrink-0" aria-hidden>
        <div className="rounded-md bg-gray-200 animate-pulse w-20 h-8 md:w-36 md:h-9" />
      </div>
    </div>
  );
};

export default CardSkeleton;
