"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store"; // pastikan AppDispatch di-export dari store/index.ts
import { logoutUser } from "@/features/auth/authThunks"; // sesuaikan path-nya
import { ChevronRight, CircleUserRound } from "lucide-react";

type Props = {
  pageName?: string;
  pageBefore?: string; // tidak wajib
  pathBack?: string;
};

export default function Navbar({ pageName, pageBefore, pathBack }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); // logout Supabase + reset Redux
      router.push("/login"); // redirect ke halaman login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="w-full bg-primaryBg text-primaryText px-6 py-3 flex justify-between items-center border-b">
      <div className="flex items-center gap-4">
        {pageBefore && pathBack && (
          <>
            <button
              onClick={() => router.push(pathBack)}
              className="text-base md:text-lg font-semibold border-2 px-4 py-1 rounded-lg"
              aria-label="Back"
            >
              {pageBefore}
            </button>
            <ChevronRight />
          </>
        )}

        <h1
          className={`text-base md:text-lg font-semibold px-4 py-1 rounded-lg ${
            pageBefore ? "border-2 border-gray-300 bg-gray-200" : ""
          }`}
        >
          {pageName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
          aria-label="Profile"
        >
          <CircleUserRound />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
