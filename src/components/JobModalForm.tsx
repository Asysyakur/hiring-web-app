"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// compact radio group component
const RadioOptions: React.FC<{
  name: string;
  defaultValue?: string;
  important?: boolean;
}> = ({ name, defaultValue, important }) => {
  const options = [
    { value: "mandatory", label: "Mandatory" },
    { value: "optional", label: "Optional" },
    { value: "off", label: "Off" },
  ];

  if (important) {
    return (
      <div role="radiogroup" className="flex items-center gap-2">
        {options.map((opt) => {
          const isMandatory = opt.value === "mandatory";
          return (
            <label
              key={opt.value}
              className={`inline-flex items-center ${
                isMandatory ? "cursor-default" : "cursor-not-allowed"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isMandatory}
                readOnly
                disabled={!isMandatory}
                className="sr-only peer"
                aria-checked={isMandatory}
                aria-disabled={!isMandatory}
              />
              <span
                className={`inline-flex items-center px-3 py-1.5 border rounded-full transition ${
                  isMandatory
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-200 text-gray-400 bg-gray-200"
                }`}
                title={
                  isMandatory
                    ? "This field is mandatory"
                    : "Disabled when field is mandatory"
                }
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div role="radiogroup" className="flex items-center gap-2">
      {options.map((opt) => (
        <label key={opt.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            defaultChecked={opt.value === defaultValue}
            className="sr-only peer"
            aria-checked={opt.value === defaultValue}
          />
          <span
            className="inline-flex items-center px-3 py-1.5 border rounded-full transition
                       border-gray-300 text-gray-700
                       peer-checked:border-primary peer-checked:text-primary
                       peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30"
          >
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
};

const JobFormModal: React.FC<JobFormModalProps> = ({ isOpen, onClose }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // close only when clicking the backdrop (outside modal content)
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const jobName = String(fd.get("jobName") ?? "").trim();
    const jobType = String(fd.get("jobType") ?? "").trim();
    const jobDescription = String(fd.get("jobDescription") ?? "").trim();
    const candidatesNeeded = String(fd.get("candidatesNeeded") ?? "").trim();
    const minSalary = String(fd.get("jobSalaryMin") ?? "").trim();
    const maxSalary = String(fd.get("jobSalaryMax") ?? "").trim();

    const newErrors: Record<string, string> = {};

    if (!jobName) newErrors.jobName = "Job name is required";
    if (!jobType) newErrors.jobType = "Job type is required";
    if (!jobDescription)
      newErrors.jobDescription = "Job description is required";
    if (!candidatesNeeded)
      newErrors.candidatesNeeded = "Number of candidates is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return;

    // prepare payload
    const payload: any = {
      name: jobName,
      type: jobType,
      desc: jobDescription,
      candidates_needed: Number(candidatesNeeded) || null,
      created_at: new Date().toISOString(),
    };

    // only include salary fields when provided and > 0
    const minNum = minSalary ? Number(minSalary) : 0;
    const maxNum = maxSalary ? Number(maxSalary) : 0;
    if (minNum > 0) payload.min_sal = minNum;
    if (maxNum > 0) payload.max_sal = maxNum;

    setSubmitting(true);
    try {
      const res = await addJob(payload);
      if (res.error) {
        // show a simple error message
        setErrors({ form: "Failed to create job. Try again." });
        console.error("addJob error", res.error);
      } else {
        // success
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrors({ form: "Unexpected error. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  async function addJob(job: Record<string, any>) {
    // insert only the keys present in payload
    const { data, error } = await supabase.from("jobs").insert([job]).select();
    return { data, error };
  }

  return (
    <main
      onMouseDown={handleBackdropMouseDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full md:max-w-7xl relative"
      >
        {/* header */}
        <header className="flex justify-between items-center p-6 border-b pb-6">
          <h2 className="text-xl font-semibold">Job Opening</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            ✕
          </button>
        </header>

        {/* form */}
        <form onSubmit={handleSubmit}>
          <section className="space-y-4 p-6 overflow-y-auto max-h-[70vh]">
            <div>
              <label
                htmlFor="jobName"
                className="block text-sm font-medium mb-1"
              >
                Job Name <span className="text-danger">*</span>
              </label>
              <input
                id="jobName"
                name="jobName"
                type="text"
                placeholder="Ex. Front End Engineer"
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.jobName ? "border-danger" : ""
                }`}
                aria-invalid={!!errors.jobName}
                aria-describedby={errors.jobName ? "jobName-error" : undefined}
              />
              {errors.jobName && (
                <p id="jobName-error" className="text-danger text-sm mt-1">
                  {errors.jobName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="jobType"
                className="block text-sm font-medium mb-1"
              >
                Job Type <span className="text-danger">*</span>
              </label>
              <select
                id="jobType"
                name="jobType"
                defaultValue=""
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.jobType ? "border-danger" : ""
                }`}
                aria-invalid={!!errors.jobType}
                aria-describedby={errors.jobType ? "jobType-error" : undefined}
              >
                <option value="" disabled>
                  Select job type
                </option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
              {errors.jobType && (
                <p id="jobType-error" className="text-danger text-sm mt-1">
                  {errors.jobType}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium mb-1"
              >
                Job Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={5}
                aria-readonly="true"
                placeholder="Ex."
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.jobDescription ? "border-danger" : ""
                }`}
                aria-invalid={!!errors.jobDescription}
                aria-describedby={
                  errors.jobDescription ? "jobDescription-error" : undefined
                }
              />
              {errors.jobDescription && (
                <p
                  id="jobDescription-error"
                  className="text-danger text-sm mt-1"
                >
                  {errors.jobDescription}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="candidatesNeeded"
                className="block text-sm font-medium mb-1"
              >
                Number of Candidates Needed{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                id="candidatesNeeded"
                name="candidatesNeeded"
                type="number"
                min={1}
                placeholder="Ex. 2"
                className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.candidatesNeeded ? "border-danger" : ""
                }`}
                aria-invalid={!!errors.candidatesNeeded}
                aria-describedby={
                  errors.candidatesNeeded ? "candidatesNeeded-error" : undefined
                }
              />
              {errors.candidatesNeeded && (
                <p
                  id="candidatesNeeded-error"
                  className="text-danger text-sm mt-1"
                >
                  {errors.candidatesNeeded}
                </p>
              )}
            </div>

            <hr className="my-4 border-t-2 border-dashed border-gray-300" />

            <label className="block text-sm font-medium">Job Salary</label>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="jobSalaryMin"
                  className="block text-sm font-medium mb-1"
                >
                  Minimum Estimated Salary
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0">
                    Rp
                  </span>
                  <input
                    id="jobSalaryMin"
                    name="jobSalaryMin"
                    type="number"
                    min={1000000}
                    max={100000000}
                    step={100000}
                    placeholder="7.000.000"
                    aria-describedby="salaryHelp"
                    className="w-full border rounded-r-lg p-2 border-l-0 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="text-xl mt-5 text-gray-500 hidden md:block">
                —
              </div>

              <div className="flex-1">
                <label
                  htmlFor="jobSalaryMax"
                  className="block text-sm font-medium mb-1"
                >
                  Maximum Estimated Salary
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0">
                    Rp
                  </span>
                  <input
                    id="jobSalaryMax"
                    name="jobSalaryMax"
                    type="number"
                    min={1000000}
                    max={100000000}
                    step={100000}
                    placeholder="8.000.000"
                    aria-describedby="salaryHelp"
                    className="w-full border rounded-r-lg p-2 border-l-0 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <section className="mt-6 border border-gray-300 rounded-lg p-4">
              <h3 className="text-sm md:text-base font-medium mb-6">
                Minimum Profile Information Required
              </h3>

              <div className="px-4 text-sm md:text-base">
                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">Full Name</label>
                  <RadioOptions
                    name="fullnameRequirement"
                    defaultValue="mandatory"
                    important
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">
                    Photo Profile
                  </label>
                  <RadioOptions
                    name="photoRequirement"
                    defaultValue="mandatory"
                    important
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">Gender</label>
                  <RadioOptions
                    name="genderRequirement"
                    defaultValue="mandatory"
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">Domicile</label>
                  <RadioOptions
                    name="domicileRequirement"
                    defaultValue="mandatory"
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">Email</label>
                  <RadioOptions
                    name="emailRequirement"
                    defaultValue="mandatory"
                    important
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">Phone Number</label>
                  <RadioOptions
                    name="phoneRequirement"
                    defaultValue="mandatory"
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4 border-b-2">
                  <label className="block font-normal mb-1">
                    Linkedin link
                  </label>
                  <RadioOptions
                    name="linkedinRequirement"
                    defaultValue="mandatory"
                  />
                </div>

                <div className="mb-4 flex justify-between items-center py-4">
                  <label className="block font-normal mb-1">
                    Date of birth
                  </label>
                  <RadioOptions
                    name="dobRequirement"
                    defaultValue="mandatory"
                  />
                </div>
              </div>
            </section>
          </section>

          {/* button section */}
          <div className="flex justify-end space-x-4 p-6 border-t">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default JobFormModal;
