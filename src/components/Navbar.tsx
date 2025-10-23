"use client";

import { useRouter } from "next/navigation";

export default function Navbar({pageName}: {pageName?: string}) {
  const router = useRouter();

  return (
    <nav className="w-full bg-primaryBg text-primaryText px-6 py-3 flex justify-between items-center border-b">
      <h1 className="text-xl font-bold tracking-wide">{pageName || "Job List"}</h1>

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
            stroke-width="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
