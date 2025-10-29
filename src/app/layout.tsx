import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { Toaster } from "sonner";
import Script from "next/script"; // ⬅️ tambahkan ini

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hiring Management App",
  description: "Manage job postings and applicants easily",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Prefetch file WASM biar di-cache sebelum dipakai */}
        <link
          rel="prefetch"
          href="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_simd_wasm_bin.wasm"
          as="fetch"
          type="application/wasm"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-800`}
      >
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#fff",
              color: "#333",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              borderLeft: "4px solid #009999",
            },
          }}
        />
        <ClientProviders>{children}</ClientProviders>

        {/* Prefetch via JS juga (optional, buat jaga-jaga) */}
        <Script
          id="prefetch-mediapipe-wasm"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              fetch("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands_solution_simd_wasm_bin.wasm", { mode: "no-cors" });
            `,
          }}
        />
      </body>
    </html>
  );
}
