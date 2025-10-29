"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import { AuthProvider } from "@/context/AuthContext";

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <Provider store={store}>
          {children}
        </Provider>
      </AuthProvider>
    </SessionContextProvider>
  );
};
