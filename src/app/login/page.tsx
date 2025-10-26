"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  loginUser,
  loginWithGoogle,
  signInWithMagicLink,
} from "@/features/auth/authThunks";
import Input from "@/components/Form/Input";
import { Button } from "@/components/Form/Button";
import { Mail, KeyRound } from "lucide-react";
import Logo from "@/assets/Logo Rakamin.svg";
import Image from "next/image";
import LogoGoogle from "@/assets/GoogleLogo.svg";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magiclink">("password");
  const [errors, setNewErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewErrors({});
  }, [email, password, mode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const emailRaw = (fd.get("email") as string)?.trim();
    const passwordRaw = (fd.get("password") as string)?.trim();

    const newErrors: Record<string, string> = {};

    if (!emailRaw) {
      newErrors.email = "Email wajib diisi";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailRaw)) {
        newErrors.email = "Email tidak valid";
      }
    }

    if (mode === "password") {
      if (!passwordRaw) {
        newErrors.password = "Password wajib diisi";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setNewErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "magiclink") {
        await dispatch(signInWithMagicLink({ email: emailRaw })).unwrap();
        localStorage.setItem("verifyEmail", emailRaw);
        router.push("/verify");
      } else {
        await dispatch(
          loginUser({ email: emailRaw, password: passwordRaw })
        ).unwrap();
        router.push("/dashboard"); // ubah sesuai halaman setelah login
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    if (isSubmitting || loading) return;
    dispatch(loginWithGoogle());
  };
console.log(error);
  const busy = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex mb-4 items-start w-full max-w-md">
        <Image src={Logo} alt="Rakamin Logo" width={150} height={50} />
      </div>

      <div className="bg-white shadow-md w-full max-w-md p-8 rounded-xl">
        {/* Header */}
        <div className="flex flex-col items-start mb-4 gap-2">
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

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 py-1 rounded relative mb-3 text-xs text-center">
            {error}{" "}
            <span><a href="/register" className="font-medium hover:underline">Daftar</a></span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          aria-busy={busy}
        >
          <Input
            label="Email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={busy}
          />

          {mode === "password" && (
            <>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  wrapperClassName="-mb-2"
                  errorBorder={!!errors.password}
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const inp = document.getElementById(
                      "password"
                    ) as HTMLInputElement | null;
                    if (!inp) return;
                    inp.type = inp.type === "password" ? "text" : "password";
                    const svgs = e.currentTarget.querySelectorAll("svg");
                    svgs.forEach((s) => s.classList.toggle("hidden"));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 mt-1 text-gray-600"
                  aria-label="Toggle password visibility"
                  disabled={busy}
                >
                  <Eye className="w-5 h-5 hidden" />
                  <EyeClosed className="w-5 h-5" />
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </>
          )}

          <Button
            type="submit"
            variant="secondary"
            label={
              busy
                ? "Memproses..."
                : mode === "password"
                ? "Masuk"
                : "Kirim Link Login"
            }
            className="w-full text-lg"
            disabled={busy}
          />
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-500 px-3">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Mode Switch + Google */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() =>
              setMode(mode === "password" ? "magiclink" : "password")
            }
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition disabled:opacity-50"
            disabled={busy}
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
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <Image src={LogoGoogle} alt="Google Logo" width={25} height={25} />
            <span className="text-lg">
              {busy ? "Memproses..." : "Lanjutkan dengan Google"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
