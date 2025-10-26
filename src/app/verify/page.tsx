"use client";

import { useEffect, useState } from "react";
import VerifyImage from "@/assets/EmailVerify.svg";
import Image from "next/image";

export default function VerifyPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("verifyEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      localStorage.removeItem("verifyEmail"); // opsional, biar gak tersimpan terus
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-background shadow-md p-8 rounded-xl max-w-2xl w-full text-center justify-center flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-4">Periksa Email Anda</h1>
        <p className="text-gray-600">
          Kami telah mengirimkan link verifikasi ke{" "}
          <span className="font-medium text-primary">{email}</span>. yang
          berlaku dalam 30 menit
        </p>
        <div className="mt-6">
          <Image
            src={VerifyImage}
            alt="Verify Email"
            width={300}
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
