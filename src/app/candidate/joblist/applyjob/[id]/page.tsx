"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CameraCapture from "@/components/CameraCapture";
import DefaultAvatar from "@/assets/Default Avatar.png";
import SelectField from "@/components/Form/Select";
import Input from "@/components/Form/Input";
import PhoneInput from "@/components/Form/PhoneInput";
import DatePicker from "@/components/Form/DatePicker";
import { Label } from "@/components/ui/label";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

interface Job {
  id: string;
  name: string;
  title?: string;
  description?: string;
  min_sal?: number;
  max_sal?: number;
  created_at?: string;
  min_profile?: Record<string, "mandatory" | "optional" | "off">;
}

const ApplyJob: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const { candidate, user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewSrc, setPreviewSrc] = useState(
    applicationData?.photoProfile || ""
  );
  const [domicile, setDomicile] = useState(applicationData?.domicile || "");
  const [phone, setPhone] = useState(applicationData?.phone || "");
  const [fullName, setFullName] = useState(applicationData?.fullName || "");
  const [dob, setDob] = useState(applicationData?.dob || "");
  const [pronoun, setPronoun] = useState(applicationData?.pronoun || "");
  const [email, setEmail] = useState(applicationData?.email || "");
  const [linkedin, setLinkedin] = useState(applicationData?.linkedin || "");
  const fieldsOrder = [
    "photo",
    "fullname",
    "dob",
    "pronoun",
    "gender",
    "domicile",
    "phone",
    "email",
    "linkedin",
  ];

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
    if (user && candidate) {
      setApplicationData({
        userId: user.id,
        photoProfile: candidate.avatar_url,
        fullName: user.full_name,
        email: user.email,
        linkedin: candidate.linkedin,
        domicile: candidate.domicile,
        pronoun: candidate.pronoun,
        dob: candidate.dob,
      });
    }
  }, [user, candidate]);

  useEffect(() => {
    if (applicationData) {
      setPreviewSrc(applicationData.photoProfile || "");
      setFullName(applicationData.fullName || "");
      setEmail(applicationData.email || "");
      setLinkedin(applicationData.linkedin || "");
      setDomicile(applicationData.domicile || "");
      setPronoun(applicationData.pronoun || "");
      setDob(applicationData.dob ? new Date(applicationData.dob) : null);
      setPhone(applicationData.phone || "");
    }
  }, [applicationData]);

  // Fetch job
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
    payload["job_id"] = id;
    console.log("aa", payload);

    // Validasi manual berdasarkan min_profile
    const newErrors: Record<string, string> = {};
    if (job?.min_profile) {
      for (const [key, value] of Object.entries(job.min_profile)) {
        if (value === "mandatory") {
          switch (key) {
            case "fullname":
              if (!payload.fullName)
                newErrors.fullName = "Full name is required";
              break;
            case "dob":
              if (!payload.dobPicker)
                newErrors.dobPicker = "Date of birth is required";
              break;
            case "pronoun":
            case "gender":
              if (!payload.pronoun) newErrors.pronoun = "Pronoun is required";
              break;
            case "domicile":
              if (!payload.domicile)
                newErrors.domicile = "Domicile is required";
              break;
            case "phone":
              if (!payload.phone) newErrors.phone = "Phone number is required";
              break;
            case "email":
              if (!payload.email) newErrors.email = "Email is required";
              break;
            case "linkedin":
              if (!payload.linkedin)
                newErrors.linkedin = "LinkedIn profile is required";
              break;
            case "photo":
              if (!payload.profile_photo)
                newErrors.profile_photo = "Profile photo is required";
              break;
          }
        }
      }
    }

    setFormErrors(newErrors);
    console.log("errors", newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    const { error } = await supabase.from("applications").insert([payload]);
    setLoading(false);
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: payload.fullName,
        avatar_url: payload.profile_photo,
        email: payload.email,
      })
      .eq("id", user?.id);
    const { error: candidateError } = await supabase
      .from("candidate_attributes")
      .update({
        user_id: user?.id,
        domicile: payload.domicile,
        pronoun: payload.pronoun,
        linkedin: payload.linkedin,
        dob: payload.dobPicker,
      })
      .eq("user_id", user?.id);

    if (error || profileError || candidateError) {
      console.error("Error submitting:", error);
      alert("❌ Failed to submit application. Please try again.");
    } else {
      alert("✅ Application submitted successfully!");
      router.push("/success");
    }
  };
  console.log(job);
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="max-w-3xl mx-auto p-6">
          {!id && <p className="text-yellow-600">No job ID provided.</p>}
          {loading && !job && !applicationData && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {job && applicationData && (
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
                className="flex flex-col gap-6 overflow-y-auto max-h-[85vh] w-full"
              >
                <div className="flex flex-col gap-6 px-16">
                  {fieldsOrder.map((key) => {
                    const value = job.min_profile?.[key];
                    if (!value || value === "off") return null;
                    const isRequired = value === "mandatory";

                    switch (key) {
                      case "fullname":
                        return (
                          <Input
                            key={key}
                            label="Full name"
                            name="fullName"
                            placeholder="Enter your full name"
                            required={isRequired}
                            error={formErrors.fullName}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        );
                      case "dob":
                        return (
                          <DatePicker
                            key={key}
                            label="Date of birth"
                            name="dobPicker"
                            placeholder="Select your date of birth"
                            required={isRequired}
                            error={formErrors.dobPicker}
                            value={dob}
                            onChange={(val) =>
                              setDob(val ? new Date(val) : null)
                            }
                          />
                        );
                      case "pronoun":
                      case "gender":
                        return (
                          <div key={key}>
                            <Label>
                              Pronoun (Gender){" "}
                              {isRequired && (
                                <span className="text-destructive">*</span>
                              )}
                            </Label>
                            <div className="flex flex-wrap gap-6 mt-1">
                              {[
                                {
                                  label: "She / Her (Female)",
                                  value: "she/her",
                                },
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
                                    required={isRequired}
                                    checked={pronoun === p.value}
                                    onChange={() => setPronoun(p.value)}
                                  />
                                  <span>{p.label}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors.pronoun && (
                              <p className="text-destructive text-sm mt-3">
                                {formErrors.pronoun}
                              </p>
                            )}
                          </div>
                        );
                      case "domicile":
                        return (
                          <SelectField
                            key={key}
                            label="Domicile"
                            required={isRequired}
                            placeholder="Select domicile"
                            options={domiciles}
                            value={domicile}
                            onChange={(val) => setDomicile(val ?? "")}
                            search
                            error={formErrors.domicile}
                          />
                        );
                      case "phone":
                        return (
                          <PhoneInput
                            key={key}
                            label="Phone number"
                            required={isRequired}
                            placeholder="8XXXXXXXXX"
                            value={phone}
                            onChange={(val) => setPhone(val)}
                            error={formErrors.phone}
                          />
                        );
                      case "email":
                        return (
                          <Input
                            key={key}
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required={isRequired}
                            error={formErrors.email}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        );
                      case "linkedin":
                        return (
                          <Input
                            key={key}
                            label="LinkedIn profile"
                            type="url"
                            name="linkedin"
                            placeholder="https://www.linkedin.com/in/your-profile"
                            required={isRequired}
                            error={formErrors.linkedin}
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                          />
                        );
                      case "photo":
                        return (
                          <div
                            key={key}
                            className="flex flex-col gap-2 w-fit justify-start"
                          >
                            {isRequired && (
                              <div className="text-destructive text-sm font-medium">
                                * Required
                              </div>
                            )}
                            <Label>Profile photo </Label>
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
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
                {/* Submit button */}
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
              </form>
            </main>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ApplyJob;
