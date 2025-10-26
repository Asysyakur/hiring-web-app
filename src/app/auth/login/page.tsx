"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { loginUser, loginWithGoogle } from "@/features/auth/authThunks";
import Input from "@/components/Form/Input";
import { Button } from "@/components/Form/Button";
import { Mail, KeyRound } from "lucide-react";
import Logo from "@/assets/Logo Rakamin.svg";
import Image from "next/image";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magiclink">("password");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleAuth = () => {
    dispatch(loginWithGoogle());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex mb-4 items-start w-full max-w-md">
        <Image src={Logo} alt="Rakamin Logo" width={150} height={50} />
      </div>
      <div className="bg-white shadow-md w-full max-w-md p-8 rounded-xl">
        <div className="flex flex-col items-start mb-6 gap-2">
          <h1 className="text-xl font-semibold">Masuk ke Rakamin</h1>
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Daftar
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {mode === "password" && (
            <Input
              label="Password"
              id="password"
              name="password"
              placeholder="********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            variant="secondary"
            label={loading ? "Memproses..." : "Masuk"}
            className="w-full text-lg"
            disabled={loading}
          />
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500 px-3">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() =>
              setMode(mode === "password" ? "magiclink" : "password")
            }
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition"
          >
            {mode === "password" ? (
              <Mail className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <KeyRound className="w-5 h-5" strokeWidth={2.5} />
            )}
            <span className="text-lg">
              {mode === "password" ? "Kirim link login" : "Gunakan kata sandi"}
            </span>
          </button>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <img src="/google-logo.png" alt="Google Logo" className="w-5 h-5" />
            <span className="text-lg">
              {loading ? "Memproses..." : "Lanjutkan dengan Google"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
