"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchJobById,
  setApplicationData,
  updateField,
  submitApplication,
} from "@/features/jobApplicationSlice";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import CameraCapture from "@/components/CameraCapture";
import Input from "@/components/Form/Input";
import PhoneInput from "@/components/Form/PhoneInput";
import SelectField from "@/components/Form/Select";
import DatePicker from "@/components/Form/DatePicker";
import Loading from "@/components/Loading";
import DefaultAvatar from "@/assets/Default Avatar.png";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const ApplyJob: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const id = params?.id as string;

  const { user, candidate, company } = useAuth();
  const { job, applicationData, loading, error } = useSelector(
    (state: RootState) => state.jobApplications
  );

  // 🔹 Daftar opsi untuk SelectField
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

  const fieldsOrder = [
    "photo",
    "fullame",
    "dob",
    "pronoun",
    "gender",
    "domicile",
    "phone",
    "email",
    "linkedin",
  ];

  // 🟩 Ambil detail job
  useEffect(() => {
    if (id) dispatch(fetchJobById(id));
  }, [id, dispatch]);

  // 🟩 Set data awal ke Redux dari user dan candidate
  useEffect(() => {
    if (!user || !candidate) return;

    dispatch(
      setApplicationData({
        user_id: user.id,
        fullName: user.full_name ?? "",
        email: user.email ?? "",
        linkedin: candidate?.linkedin ?? "",
        domicile: candidate?.domicile ?? "",
        pronoun: candidate?.pronoun ?? "",
        dob: candidate?.dob ?? null,
        phone: candidate?.phone ?? "",
        profile_photo: user.avatar_url ?? "",
      })
    );
  }, [user, candidate, dispatch]);

  // 🟩 Handle submit aplikasi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!applicationData) return;

    const payload = {
      ...applicationData,
      job_id: id,
    };

    // 🔹 Validasi field sesuai job.min_profile
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
              if (!payload.dob) newErrors.dob = "Date of birth is required";
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
    console.log("Payload for Submission:", payload);

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation Errors:", newErrors);
      alert("⚠️ Please fill all required fields!");
      return;
    }

    const result = await dispatch(submitApplication(payload));
    if (submitApplication.fulfilled.match(result)) {
      alert("✅ Application submitted successfully!");
      router.push("/success");
    } else {
      alert("❌ Failed to submit application!");
    }
  };

  // 🟩 Loading & Error states
  if (loading && !job) return <Loading />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="max-w-3xl mx-auto p-0 md:p-6">
          <main className="bg-white shadow-lg border border-border overflow-hidden">
            {/* Header */}
            <section className="flex items-center justify-between px-5 py-4 md:px-10 md:py-8 bg-background">
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => router.back()}
                  aria-label="Go back"
                  className="flex items-center justify-center w-7 h-7 rounded-lg shadow-sm hover:bg-gray-100 border border-border transition"
                >
                  <ArrowLeft className="p-0.5" strokeWidth={2} />
                </button>
                <h1 className="text-base md:text-xl font-semibold">
                  Apply for {job?.name ?? "Job"} at {job?.title ?? "Rakamin"}
                </h1>
              </div>
              <span className="text-xs md:text-sm text-gray-500 text-end">
                ℹ️ This field required to fill
              </span>
            </section>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 overflow-y-auto max-h-screen md:max-h-[85vh] w-full"
            >
              <div className="flex flex-col gap-4 md:gap-6 px-6 md:px-16">
                {fieldsOrder.map((key) => {
                  const value = job?.min_profile?.[key];
                  if (!value || value === "off") return null;
                  const isRequired = value === "mandatory";

                  switch (key) {
                    case "fullname":
                      return (
                        <Input
                          key={key}
                          label="Full Name"
                          name="fullName"
                          placeholder="Enter your full name"
                          required={isRequired}
                          value={applicationData?.fullName || ""}
                          onChange={(e) =>
                            dispatch(
                              updateField({
                                key: "fullName",
                                value: e.target.value,
                              })
                            )
                          }
                        />
                      );

                    case "dob":
                      return (
                        <DatePicker
                          key={key}
                          label="Date of Birth"
                          name="dob"
                          required={isRequired}
                          value={
                            applicationData?.dob
                              ? new Date(applicationData.dob)
                              : undefined
                          }
                          onChange={(val) => {
                            const dobString =
                              val instanceof Date ? val.toISOString() : val;
                            dispatch(
                              updateField({
                                key: "dob",
                                value: dobString,
                              })
                            );
                          }}
                        />
                      );

                    case "pronoun":
                    case "gender":
                      return (
                        <div key={key}>
                          <Label>
                            Pronoun{" "}
                            {isRequired && (
                              <span className="text-destructive">*</span>
                            )}
                          </Label>
                          <div className="flex gap-6 mt-1">
                            {[
                              { label: "She / Her", value: "she/her" },
                              { label: "He / Him", value: "he/him" },
                            ].map((p) => (
                              <label
                                key={p.value}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <input
                                  type="radio"
                                  name="pronoun"
                                  value={p.value}
                                  checked={applicationData?.pronoun === p.value}
                                  onChange={() =>
                                    dispatch(
                                      updateField({
                                        key: "pronoun",
                                        value: p.value,
                                      })
                                    )
                                  }
                                />
                                {p.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      );

                    case "domicile":
                      return (
                        <SelectField
                          key={key}
                          label="Domicile"
                          required={isRequired}
                          options={domiciles}
                          value={applicationData?.domicile || ""}
                          onChange={(val) =>
                            dispatch(
                              updateField({
                                key: "domicile",
                                value: val ?? "",
                              })
                            )
                          }
                          search
                        />
                      );

                    case "phone":
                      return (
                        <PhoneInput
                          key={key}
                          label="Phone Number"
                          required={isRequired}
                          placeholder="8XXXXXXXXX"
                          value={applicationData?.phone || ""}
                          onChange={(val) =>
                            dispatch(updateField({ key: "phone", value: val }))
                          }
                        />
                      );

                    case "email":
                      return (
                        <Input
                          key={key}
                          label="Email"
                          type="email"
                          name="email"
                          required={isRequired}
                          value={applicationData?.email || ""}
                          onChange={(e) =>
                            dispatch(
                              updateField({
                                key: "email",
                                value: e.target.value,
                              })
                            )
                          }
                        />
                      );

                    case "linkedin":
                      return (
                        <Input
                          key={key}
                          label="LinkedIn Profile"
                          type="url"
                          name="linkedin"
                          placeholder="https://www.linkedin.com/in/your-profile"
                          required={isRequired}
                          value={applicationData?.linkedin || ""}
                          onChange={(e) =>
                            dispatch(
                              updateField({
                                key: "linkedin",
                                value: e.target.value,
                              })
                            )
                          }
                        />
                      );

                    case "photo":
                      return (
                        <div key={key} className="flex flex-col gap-2 w-fit">
                          {isRequired && (
                            <span className="text-destructive font-medium text-sm">
                              * Required
                            </span>
                          )}
                          <Label>Profile Photo </Label>
                          <img
                            src={
                              applicationData?.profile_photo || DefaultAvatar.src
                            }
                            alt="Profile preview"
                            className="w-32 h-32 rounded-full border-2 border-border object-cover"
                          />
                          <CameraCapture
                            onCapture={(dataUrl) =>
                              dispatch(
                                updateField({
                                  key: "profile_photo",
                                  value: dataUrl,
                                })
                              )
                            }
                          />
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 w-full bg-white border-t border-border py-4 flex justify-center px-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primaryDark transition w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ApplyJob;
