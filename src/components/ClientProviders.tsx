"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase"; // supabase client

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <SessionContextProvider supabaseClient={supabase}>
        {children}
      </SessionContextProvider>
    </Provider>
  );
};
