"use client";

import { useRouter } from "next/navigation";

type Props = {
  pageName?: string;
  pageBefore?: string; // tidak wajib
  pathBack?: string;
};

export default function Navbar({ pageName, pageBefore, pathBack }: Props) {
  const router = useRouter();

  return (
    <nav className="w-full bg-primaryBg text-primaryText px-6 py-3 flex justify-between items-center border-b">
      <div className="flex items-center gap-4">
        {pageBefore && pathBack ? (
          <>
            <button
              onClick={() => router.push(pathBack)}
              className="text-base md:text-lg font-semibold border-2 px-4 py-1 rounded-lg"
              aria-label="Back"
            >
              {pageBefore}
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="3"
              stroke="currentColor"
              className="size-6 -mx-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </>
        ) : null}

        <h1
          className={`text-base md:text-lg font-semibold px-4 py-1 rounded-lg ${
            pageBefore ? "border-2 border-gray-300 bg-gray-200" : ""
          }`}
        >
          {pageName}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
          aria-label="Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
