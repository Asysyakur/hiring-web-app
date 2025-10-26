// src/hooks/useAuth.ts
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // cek session saat pertama kali load
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
      console.log("🔐 Current session user:", data.session?.user);
    };

    getSession();

    // listen perubahan auth state (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return { user, loading };
};
