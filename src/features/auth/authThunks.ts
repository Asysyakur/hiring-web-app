import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import { Credentials } from "./types";
import { checkProfileExists } from "@/lib/checkProfileExists";

// LOGIN pakai email + password
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: Credentials, { rejectWithValue }) => {
    if (!email || !password) {
      return rejectWithValue("Email dan password wajib diisi");
    }

    try {
      const exists = await checkProfileExists(email);
      if (!exists)
        return rejectWithValue(
          "Email ini belum terdaftar sebagai akun di Rakamin Academy"
        );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || "Login gagal");
    }
  }
);

// REGISTER pakai email + password
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ fullName, email, password }: Credentials, { rejectWithValue }) => {
    if (!email || !password)
      return rejectWithValue("Email dan password wajib diisi");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, email: email },
        emailRedirectTo: `/`,
      },
    });

    if (error) return rejectWithValue(error.message);
    return data.user;
  }
);

// Register via magic link
export const registerWithMagicLink = createAsyncThunk(
  "auth/registerWithMagicLink",
  async ({ fullName, email }: Credentials, { rejectWithValue }) => {
    try {
      const exists = await checkProfileExists(email);
      if (exists)
        return rejectWithValue("Email ini sudah terdaftar. Silakan login.");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { full_name: fullName, email: email },
          emailRedirectTo: `/`,
        },
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Gagal mengirim link registrasi");
    }
  }
);

// LOGIN via Magic Link (tanpa password)
export const signInWithMagicLink = createAsyncThunk(
  "auth/signInWithMagicLink",
  async ({ fullName, email }: Credentials, { rejectWithValue }) => {
    try {
      const exists = await checkProfileExists(email);
      if (!exists)
        return rejectWithValue(
          "Email ini belum terdaftar sebagai akun di Rakamin Academy"
        );

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `/`,
        },
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Gagal mengirim link login");
    }
  }
);

// LOGIN / SIGNUP dengan GOOGLE
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `/`,
      },
    });

    if (error) return rejectWithValue(error.message);
    return data; // URL redirect otomatis ditangani
  }
);

// LOGOUT user
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return null;
});

// Fetch profile lengkap user
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return rejectWithValue("User tidak ditemukan");

      // Ambil data dari tabel profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          avatar_url,
          company_attribute (
            id,
            company_name,
            industry,
            company_size
          ),
          candidate_attribute (
            id,
            experience,
            skills
          )
        `
        )
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      return profile; // ini akan dikirim ke Redux
    } catch (err: any) {
      return rejectWithValue(err.message || "Gagal memuat data profil");
    }
  }
);
