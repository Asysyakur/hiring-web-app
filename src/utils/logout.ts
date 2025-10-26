// src/utils/logout.ts
import { supabase } from "@/lib/supabase";

export const logout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};
