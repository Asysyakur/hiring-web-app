// src/components/ProtectedRoute.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // redirect ke halaman login
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return <>{user && children}</>;
}
