"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setRole } from "@/features/roleSlice";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRoleState] = useState<"admin" | "jobseeker" | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    dispatch(setRole(selectedRole));
    router.push(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 transition-colors duration-500">
      <div className="bg-card text-card-foreground p-8 rounded-3xl shadow-lg w-[90%] max-w-md text-center transition-colors duration-500">
        <h1 className="text-2xl font-bold mb-4">Welcome to Hiring Management App</h1>
        <p className="text-muted-foreground mb-8">Please select your role to continue</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSelectedRoleState("admin")}
            className={`border-2 rounded-xl py-3 text-lg font-medium transition-all duration-300 ${
              selectedRole === "admin"
                ? "border-danger bg-danger/10 text-danger"
                : "border-border hover:border-danger hover:bg-danger/5"
            }`}
          >
            👨‍💼 Admin (Recruiter)
          </button>

          <button
            onClick={() => setSelectedRoleState("jobseeker")}
            className={`border-2 rounded-xl py-3 text-lg font-medium transition-all duration-300 ${
              selectedRole === "jobseeker"
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border hover:border-secondary hover:bg-secondary/5"
            }`}
          >
            💼 Job Seeker
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`mt-8 w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
            selectedRole
              ? "bg-primary hover:bg-primary/90"
              : "bg-muted cursor-not-allowed text-muted-foreground"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
