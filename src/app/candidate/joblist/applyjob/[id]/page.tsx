"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CameraCapture from "@/components/CameraCapture";
import DefaultAvatar from "@/assets/Default Avatar.png";
import SelectField from "@/components/Form/Select";
import Input from "@/components/Form/Input";

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

  return (
    <div className="min-h-screen bg-primaryBg transition-colors duration-500">
      <div className="p-6 flex flex-col">
        {!id && (
          <p className="text-yellow-600">No job id provided in the route.</p>
        )}
        {loading && (
          <section className="flex flex-col">
            <div className="h-4 rounded-md bg-gray-200 animate-pulse w-1/6" />
            <div className="mt-8 border-2 rounded-lg p-6 bg-white">
              <div className="w-full min-h-[220px] md:min-h-[500px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-32">
                <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse mb-4" />
                <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>
          </section>
        )}
        {error && <p className="mt-4 text-red-600">Error: {error}</p>}

        {job && (
          <main className="flex bg-primaryBg flex-col w-full border-2 max-w-3xl mx-auto">
            <section className="flex justify-between items-center p-8">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  aria-label="Go back"
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 border-2 border-gray-200 shadow-sm transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>
                <div className="text-xl font-semibold">
                  Apply {job.name} at {job?.title || "Rakamin"}
                </div>
              </div>
              <div>ℹ️ This field required to fill</div>
            </section>
            <section className="px-16 mb-8">
              <form
                className="flex flex-col gap-6 text-sm font-medium"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  // Convert FormData to object for quick inspection / submission
                  const obj: Record<string, any> = {};
                  fd.forEach((v, k) => {
                    obj[k] = v;
                  });
                  // TODO: replace with actual submit logic (supabase / API call)
                  console.log("Profile form submit", obj);
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-danger font-semibold">* Required</span>
                  <label htmlFor="profile">Profile photo</label>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-start gap-4">
                      <div className="w-36 h-36 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                        <img
                          id="profilePreview"
                          alt="profile preview"
                          className="w-full h-full object-cover"
                          src={previewSrc || DefaultAvatar.src}
                        />
                      </div>

                      <CameraCapture
                        onCapture={(dataUrl) => setPreviewSrc(dataUrl)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="hidden"
                        id="profile"
                        name="profile"
                        accept="image/*"
                        className="text-sm"
                        value={previewSrc || DefaultAvatar.src}
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            const img = document.getElementById(
                              "profilePreview"
                            ) as HTMLImageElement | null;
                            if (img) img.src = url;
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Input
                  label="Full name"
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                />

                <Input
                  label="Date of birth"
                  type="date"
                  id="dob"
                  name="dob"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="font-medium">
                    Pronoun (Gender)
                    <span className="text-danger font-semibold">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pronoun"
                        value="she/her"
                        className="h-5 w-5 accent-primary"
                      />
                      <span>She / Her (Female)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pronoun"
                        value="he/him"
                        className="h-5 w-5 accent-primary"
                      />
                      <span>He / Him (Male)</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <SelectField
                    label="Domicile"
                    required
                    placeholder="Select domicile"
                    options={domiciles}
                    value={domicile}
                    onChange={(val) => setDomicile(val ?? "")}
                    search
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone">
                    Phone number
                    <span className="text-danger font-semibold">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="border-2 border-gray-200 p-2 rounded-md"
                    placeholder="8XXXXXXXXX"
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                />

                <Input
                  label="LinkedIn profile"
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  required
                  placeholder="https://www.linkedin.com/in/your-profile"
                />

                <div className="flex justify-center w-full">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default ApplyJob;
