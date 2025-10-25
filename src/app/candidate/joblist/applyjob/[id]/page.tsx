"use client";

import React, { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CameraCapture from "@/components/CameraCapture";
import DefaultAvatar from "@/assets/Default Avatar.png";
import SelectField from "@/components/Form/Select";
import Input from "@/components/Form/Input";
import PhoneInput from "@/components/Form/PhoneInput";
import DatePicker from "@/components/Form/DatePicker";
import { Label } from "@/components/ui/label";

interface Job {
  id: string;
  name: string;
  title?: string;
  description?: string;
  min_sal?: number;
  max_sal?: number;
  created_at?: string;
}

const ApplyJob: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [domicile, setDomicile] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const domiciles = [
    "Jakarta",
    "Bandung",
    "Surabaya",
    "Yogyakarta",
    "Bali",
    "Medan",
    "Makassar",
    "Semarang",
  ];

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError(error.message);
          setJob(null);
        } else {
          setJob(data);
        }
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};
    formData.forEach((v, k) => (payload[k] = v));

    payload["job_id"] = id;
    payload["profile_photo"] = previewSrc || DefaultAvatar.src;
    payload["domicile"] = domicile;
    payload["phone"] = phone;

    // --- ✅ Validasi manual sebelum kirim
    const newErrors: Record<string, string> = {};

    if (!payload.fullName) newErrors.fullName = "Full name is required";
    if (!payload.dobPicker) newErrors.dobPicker = "Date of birth is required";
    if (!payload.pronoun) newErrors.pronoun = "Please select a pronoun";
    if (!payload.domicile) newErrors.domicile = "Domicile is required";
    if (!payload.phone) newErrors.phone = "Phone number is required";
    if (!payload.email) newErrors.email = "Email is required";
    if (!payload.linkedin) newErrors.linkedin = "LinkedIn profile is required";

    setFormErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .insert([payload]);
    setLoading(false);

    if (error) {
      console.error("Error submitting:", error);
    } else {
      alert("✅ Application submitted successfully!");
      router.push("/success");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto p-6">
        {!id && <p className="text-yellow-600">No job ID provided.</p>}

        {loading && !job && (
          <div className="animate-pulse flex flex-col gap-6">
            <div className="h-6 bg-background rounded w-1/4" />
            <div className="h-[400px] bg-gray-100 rounded-xl" />
          </div>
        )}

        {error && <p className="text-red-600 mt-4">Error: {error}</p>}

        {job && (
          <main className="bg-white shadow-lg border border-border overflow-hidden">
            {/* Header */}
            <section className="flex items-center justify-between px-10 py-8 bg-background">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  aria-label="Go back"
                  className="flex items-center justify-center w-7 h-7 rounded-lg shadow-sm hover:bg-gray-100 border border-border transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>
                <h1 className="text-lg md:text-xl font-semibold">
                  Apply for {job.name} at {job?.title || "Rakamin"}
                </h1>
              </div>
              <span className="text-sm text-gray-500">
                ℹ️ This field is required to fill
              </span>
            </section>

            {/* Form */}
            <form
              id="applyForm"
              onSubmit={handleSubmit}
              className="p-8 px-16 flex flex-col gap-6 overflow-y-auto max-h-[75vh]"
            >
              {/* Profile Photo */}
              <div className="flex flex-col gap-3 -mt-8">
                <p className="text-destructive font-medium text-sm mb-4">
                  * Required
                </p>
                <Label className="font-medium">Profile photo</Label>
                <div className="flex flex-col items-start gap-2">
                  <div className="w-32 h-32 rounded-full border-2 border-border overflow-hidden bg-gray-100 shadow-sm">
                    <img
                      src={previewSrc || DefaultAvatar.src}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CameraCapture
                    onCapture={(dataUrl) => setPreviewSrc(dataUrl)}
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Full name"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                  error={formErrors.fullName}
                />
              </div>

              <div>
                <DatePicker
                  name="dobPicker"
                  label="Date of birth"
                  id="dobPicker"
                  placeholder="Select your date of birth"
                  required
                  error={formErrors.dobPicker}
                />
              </div>

              <div>
                <Label>
                  Pronoun (Gender) <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-6 mt-1">
                  {[
                    { label: "She / Her (Female)", value: "she/her" },
                    { label: "He / Him (Male)", value: "he/him" },
                  ].map((p) => (
                    <label
                      key={p.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="pronoun"
                        value={p.value}
                        className="h-5 w-5 accent-primary"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
                {formErrors.pronoun && (
                  <p className="text-destructive text-sm mt-3">{formErrors.pronoun}</p>
                )}
              </div>

              <div>
                <SelectField
                  label="Domicile"
                  required
                  placeholder="Select domicile"
                  options={domiciles}
                  value={domicile}
                  onChange={(val) => setDomicile(val ?? "")}
                  search
                  error={formErrors.domicile}
                />
              </div>

              <div>
                <PhoneInput
                  label="Phone number"
                  required
                  placeholder="8XXXXXXXXX"
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  error={formErrors.phone}
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  error={formErrors.email}
                />
              </div>

              <div>
                <Input
                  label="LinkedIn profile"
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  required
                  error={formErrors.linkedin}
                />
              </div>
            </form>

            {/* Submit */}
            <div className="sticky bottom-0 w-full bg-white border-t border-border py-4 flex justify-center px-6">
              <button
                type="submit"
                form="applyForm"
                className="px-8 py-3 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primaryDark transition w-full disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default ApplyJob;
