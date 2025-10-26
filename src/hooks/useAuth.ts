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
  } catch (e) {
    // ignore storage errors
    console.warn("Storage write failed:", e);
  }
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
    localStorage.removeItem(STORAGE_KEYS.profile);
    localStorage.removeItem(STORAGE_KEYS.company);
    localStorage.removeItem(STORAGE_KEYS.candidate);
  } catch {
    // ignore
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<Profile | null>(() =>
    typeof window !== "undefined" ? loadFromStorage<Profile>(STORAGE_KEYS.profile) : null
  );
  const [company, setCompany] = useState<Company | null>(() =>
    typeof window !== "undefined" ? loadFromStorage<Company>(STORAGE_KEYS.company) : null
  );
  const [candidate, setCandidate] = useState<Candidate | null>(() =>
    typeof window !== "undefined" ? loadFromStorage<Candidate>(STORAGE_KEYS.candidate) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);

        // Ambil session aktif
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const sessionUser = sessionData?.session?.user;
        if (!sessionUser) {
          // Belum login
          setUser(null);
          setCompany(null);
          setCandidate(null);
          clearAuthStorage();
          setLoading(false);
          return;
        }

        // Cek storage: jika ada data dan id cocok, pakai itu (menghindari fetch tiap page)
        const storedProfile = loadFromStorage<Profile>(STORAGE_KEYS.profile);
        const storedCompany = loadFromStorage<Company>(STORAGE_KEYS.company);
        const storedCandidate = loadFromStorage<Candidate>(STORAGE_KEYS.candidate);

        if (storedProfile?.id === sessionUser.id) {
          setUser({
            ...(storedProfile ?? {}),
            id: storedProfile.id,
            full_name: storedProfile.full_name ?? "",
            email: storedProfile.email ?? sessionUser.email ?? undefined,
          });
          setCompany(storedCompany ?? null);
          setCandidate(storedCandidate ?? null);
          setLoading(false);
          return;
        }

        // Jika tidak ada di storage atau user berbeda, ambil dari Supabase dan simpan ke storage
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        if (profileError) {
          console.warn("Profile fetch error:", profileError);
        }

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

        setUser(resolvedProfile);
        setCompany(companyData ?? null);
        setCandidate(candidateData ?? null);

        // Simpan ke storage supaya halaman lain bisa pakai tanpa fetch ulang
        saveToStorage(STORAGE_KEYS.profile, resolvedProfile);
        saveToStorage(STORAGE_KEYS.company, companyData ?? null);
        saveToStorage(STORAGE_KEYS.candidate, candidateData ?? null);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching auth data:", err);
        setUser(null);
        setCompany(null);
        setCandidate(null);
        clearAuthStorage();
        setLoading(false);
      }
    };

    getUserData();

    // Listen perubahan sesi Supabase (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          try {
            // Jika login, ambil data sekali dan simpan ke storage
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.warn("Profile fetch error on auth change:", profileError);
            }

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
          } catch (err) {
            console.error("Error handling auth change:", err);
            setUser({
              id: session.user.id,
              full_name: "",
              email: session.user.email ?? undefined,
            });
            setCompany(null);
            setCandidate(null);
            saveToStorage(STORAGE_KEYS.profile, {
              id: session.user.id,
              full_name: "",
              email: session.user.email ?? undefined,
            });
            saveToStorage(STORAGE_KEYS.company, null);
            saveToStorage(STORAGE_KEYS.candidate, null);
          }
        } else {
          // Jika logout
          setUser(null);
          setCompany(null);
          setCandidate(null);
          clearAuthStorage();
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, company, candidate, loading };
};
