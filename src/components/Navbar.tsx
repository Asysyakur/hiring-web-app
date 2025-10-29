"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { logoutUser } from "@/features/auth/authThunks";
import { ChevronRight } from "lucide-react";
import DefaultProfile from "@/assets/Default Avatar.png";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

type Props = {
  pageName?: string;
  pageBefore?: string;
  pathBack?: string;
};

export default function Navbar({ pageName, pageBefore, pathBack }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [ProfileImage, setProfileImage] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const raw = localStorage.getItem("auth_profile");
        const storedImage = raw ? JSON.parse(raw) : null;
        console.log(
          "Fetched profile image from localStorage:",
          storedImage?.avatar_url
        );
        if (storedImage?.avatar_url) {
          setProfileImage(storedImage.avatar_url);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };

    fetchProfileImage();
  }, []);
  console.log("Navbar ProfileImage:", ProfileImage);
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
        {/* Profile dropdown (shadcn) */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
              aria-label="Open profile menu"
            >
              <Image
                src={ProfileImage ? ProfileImage : DefaultProfile}
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-40 text-primaryText border rounded shadow-lg"
          >
            <DropdownMenuItem>
              <button
                onClick={() => router.push("/")}
                className="w-full text-left"
              >
                Select Role
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer hover:bg-white/10 transition"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
