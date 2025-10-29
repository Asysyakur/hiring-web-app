"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  [key: string]: any;
}

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  location?: string;
  user_id: string;
  [key: string]: any;
}

interface Candidate {
  id: string;
  domicile?: string;
  pronoun?: string;
  linkedin?: string;
  dob?: string;
  user_id?: string;
  [key: string]: any;
}

// Cache session di memory
let cachedSession: any = null;

const STORAGE_KEYS = {
  profile: "auth_profile",
  company: "auth_company",
  candidate: "auth_candidate",
};

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, data: any) {
  try {
    if (data == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {}
}

function loadFromStorage<T>(key: string): T | null {
  try {
    return safeParse<T>(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function clearAuthStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(key)
    );
  } catch {}
}

export const useAuth = () => {
  const [user, setUser] = useState<Profile | null>(() =>
    typeof window !== "undefined"
      ? loadFromStorage<Profile>(STORAGE_KEYS.profile)
      : null
  );
  const [company, setCompany] = useState<Company | null>(() =>
    typeof window !== "undefined"
      ? loadFromStorage<Company>(STORAGE_KEYS.company)
      : null
  );
  const [candidate, setCandidate] = useState<Candidate | null>(() =>
    typeof window !== "undefined"
      ? loadFromStorage<Candidate>(STORAGE_KEYS.candidate)
      : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const getUserData = async () => {
      try {
        setLoading(true);

        // Paksa refresh session di setiap reload / tab kembali
        cachedSession = null;

        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = sessionData?.session?.user;
        cachedSession = sessionUser;

        if (!sessionUser) {
          clearAuthStorage();
          if (active) {
            setUser(null);
            setCompany(null);
            setCandidate(null);
            setLoading(false);
          }
          return;
        }

        // Cek cache di localStorage
        const storedProfile = loadFromStorage<Profile>(STORAGE_KEYS.profile);
        const storedCompany = loadFromStorage<Company>(STORAGE_KEYS.company);
        const storedCandidate = loadFromStorage<Candidate>(
          STORAGE_KEYS.candidate
        );

        if (storedProfile?.id === sessionUser.id) {
          if (active) {
            setUser(storedProfile);
            setCompany(storedCompany);
            setCandidate(storedCandidate);
            setLoading(false);
          }
          return;
        }

        // Ambil data terbaru dari Supabase
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        const { data: companyData } = await supabase
          .from("company_attributes")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();

        const { data: candidateData } = await supabase
          .from("candidate_attributes")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle();

        const resolvedProfile: Profile = {
          ...(profileData ?? {}),
          id: profileData?.id ?? sessionUser.id,
          full_name: profileData?.full_name ?? "",
          email: sessionUser.email ?? undefined,
        };

        if (active) {
          setUser(resolvedProfile);
          setCompany(companyData ?? null);
          setCandidate(candidateData ?? null);
        }

        saveToStorage(STORAGE_KEYS.profile, resolvedProfile);
        saveToStorage(STORAGE_KEYS.company, companyData ?? null);
        saveToStorage(STORAGE_KEYS.candidate, candidateData ?? null);
      } catch (err) {
        console.error("Auth error:", err);
        if (active) {
          setUser(null);
          setCompany(null);
          setCandidate(null);
          clearAuthStorage();
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    // Jalankan di awal
    getUserData();

    // Listener auth Supabase (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return;

        if (session?.user) {
          cachedSession = session.user;

          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          const { data: companyData } = await supabase
            .from("company_attributes")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          const { data: candidateData } = await supabase
            .from("candidate_attributes")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          const resolvedProfile: Profile = {
            ...(profileData ?? {}),
            id: profileData?.id ?? session.user.id,
            full_name: profileData?.full_name ?? "",
            email: session.user.email ?? undefined,
          };

          setUser(resolvedProfile);
          setCompany(companyData ?? null);
          setCandidate(candidateData ?? null);

          saveToStorage(STORAGE_KEYS.profile, resolvedProfile);
          saveToStorage(STORAGE_KEYS.company, companyData ?? null);
          saveToStorage(STORAGE_KEYS.candidate, candidateData ?? null);
        } else {
          cachedSession = null;
          setUser(null);
          setCompany(null);
          setCandidate(null);
          clearAuthStorage();
        }
      }
    );

    // 🔁 Fetch ulang saat tab aktif lagi
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        cachedSession = null;
        getUserData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return { user, company, candidate, loading };
};
