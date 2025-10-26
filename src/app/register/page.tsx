"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  registerUser,
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

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magiclink">("password");
  const [errors, setNewErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewErrors({});
  }, [fullName, email, password, mode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || loading) return; // prevent double submit
    setIsSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const fullNameRaw = fd.get("fullName") as string;
    const emailRaw = fd.get("email") as string;
    const passwordRaw = fd.get("password") as string;

    const fullName = (fullNameRaw || "").trim();
    const email = (emailRaw || "").trim();
    const password = (passwordRaw || "").trim();

    const newErrors: Record<string, string> = {};

    if (!fullName) {
      newErrors.fullName = "Full name is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      // Basic RFC-like structure check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Email tidak valid";
      } else {
        // Stricter TLD/domain check: require common TLDs like .com, .net, .org, .io, .co.id, dll.
        const allowedTLDs = [
          "com",
          "net",
          "org",
          "io",
          "id",
          "co",
          "co.id",
          "edu",
          "gov",
          "biz",
          "dev",
          "app",
        ];
        const domain = email.split("@")[1] || "";
        const hasAllowedTLD = allowedTLDs.some((t) =>
          domain.toLowerCase().endsWith("." + t)
        );

        if (!hasAllowedTLD) {
          newErrors.email = "Email tidak valid";
        }
      }
    }
    if (mode === "password") {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password harus minimal 8 karakter";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors found:", newErrors);
      setNewErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "magiclink") {
        // unwrap() will throw if the thunk was rejected
        await dispatch(signInWithMagicLink({ fullName, email })).unwrap();
      } else {
        await dispatch(registerUser({ fullName, email, password })).unwrap();
      }

      // Simpan email di localStorage
      localStorage.setItem("verifyEmail", email);

      // jika sukses, route ke halaman verifikasi
      router.push("/verify");
    } catch (dispatchError) {
      // error di-handle oleh redux state (error), bisa ditambahkan handling tambahan di sini jika perlu
      console.error("Register failed", dispatchError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    if (isSubmitting || loading) return;
    dispatch(loginWithGoogle());
  };

  const busy = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex mb-4 items-start w-full max-w-md">
        <Image src={Logo} alt="Rakamin Logo" width={150} height={50} />
      </div>
      <div className="bg-white shadow-md w-full max-w-md p-8 rounded-xl">
        {/* Header */}
        <div className="flex flex-col items-start mb-6 gap-2">
          <h1 className="text-xl font-semibold">Bergabung dengan Rakamin</h1>
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Masuk
            </a>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          aria-busy={busy}
        >
          <Input
            label="Full Name"
            id="fullName"
            name="fullName"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            disabled={busy}
          />

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
                    const svgs = (
                      e.currentTarget as HTMLElement
                    ).querySelectorAll("svg");
                    svgs.forEach((s) => s.classList.toggle("hidden"));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 mt-1 text-gray-600"
                  aria-label="Toggle password visibility"
                  disabled={busy}
                >
                  {/* Eye (visible when password is hidden) */}
                  <Eye className="w-5 h-5 hidden" />

                  {/* Eye Off (hidden by default, shown when password is visible) */}
                  <EyeClosed className="w-5 h-5" />
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            variant="secondary"
            label={
              busy
                ? "Memproses..."
                : mode === "password"
                ? "Daftar"
                : "Kirim Link ke Email"
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

        {/* Buttons */}
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
              {mode === "password"
                ? `Kirim link registrasi`
                : "Gunakan kata sandi"}
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
