import { supabase } from "./supabase";

export async function checkProfileExists(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data; // true jika ada, false jika tidak
}
