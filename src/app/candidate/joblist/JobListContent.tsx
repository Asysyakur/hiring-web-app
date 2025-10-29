"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Form/Button";
import Logo from "@/assets/Logo.svg";
import EmptyState from "@/assets/Empty State.svg";
import Image from "next/image";
import CardSkeleton from "@/components/CardSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Banknote, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAppliedJobs, fetchCandidateJobs } from "@/features/jobSliceCandidate";

const JobListContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    jobs: candidateJobs,
    appliedJobs,
    loading,
  } = useSelector((state: RootState) => state.candidateJobs);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // detect mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : false);

    handler(mq as any);

    if ("addEventListener" in mq) {
      mq.addEventListener("change", handler as any);
      return () => mq.removeEventListener("change", handler as any);
    } else if ("addListener" in mq) {
      (mq as any).addListener(handler);
      return () => (mq as any).removeListener(handler);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchCandidateJobs());
    dispatch(fetchAppliedJobs());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedJob && candidateJobs.length > 0 && !isMobile) {
      setSelectedJob(candidateJobs[0]);
    }
  }, [candidateJobs, selectedJob, isMobile]);
  console.log("Selected job:", selectedJob);
  useEffect(() => {
    const jobId = searchParams?.get?.("job");
    if (jobId && candidateJobs.length > 0) {
      const job = candidateJobs.find(
        (j: any) => String(j.id) === String(jobId)
      );
      if (job) setSelectedJob(job);
    }
    if (!jobId && isMobile) setSelectedJob(null);
  }, [searchParams, candidateJobs, isMobile]);

  const handleChangePage = (jobId: string) => {
    router.push(`/candidate/joblist/applyjob/${jobId}`);
  };

  const handleJobClick = (job: any) => {
    if (isMobile) {
      // immediately set selected job so modal shows while navigation updates URL
      setSelectedJob(job);
      // build URL preserving path and setting job query
      const path = `${window.location.pathname}?job=${job.id}`;
      router.push(path);
    } else {
      setSelectedJob(job);
    }
  };

  const closeModal = () => {
    try {
      router.back();
    } catch {
      router.push(window.location.pathname);
    } finally {
      // clear selected job state immediately to avoid stale UI
      setSelectedJob(null);
    }
  };

  const jobIdInParams = !!searchParams?.get?.("job");
  const showMobileModal = isMobile && jobIdInParams && !!selectedJob;

  return (
    <div className="min-h-screen bg-primaryBg transition-colors duration-500">
      <Navbar pageName="Job List" />
      <main className="p-4 md:p-8 flex w-full items-center justify-center">
        <section className="w-full px-4 md:px-16">
          {loading ? (
            <div className="mt-8 space-y-4 flex flex-col w-full">
              {[1, 2, 3].map((key) => (
                <CardSkeleton key={key} />
              ))}
            </div>
          ) : candidateJobs.length === 0 ? (
            <div className="mt-8 w-full min-h-[220px] md:min-h-[360px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-44 text-center space-y-4">
              <Image
                src={EmptyState}
                alt="Empty state"
                className="w-36 md:w-80 h-auto object-contain mb-2"
              />
              <h2 className="text-lg md:text-2xl font-semibold">
                No job openings available
              </h2>
              <p className="text-sm md:text-base text-secondaryText max-w-xl px-4 pb-2">
                Please wait for the next batch of openings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-8 gap-8 w-full">
              <div className="md:col-span-3">
                <ul className="space-y-4">
                  {candidateJobs.map((job: any) => {
                    const isSelected = selectedJob?.id === job.id && !isMobile;
                    return (
                      <li
                        key={job.id}
                        className={`bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all ${
                          isSelected
                            ? "ring-2 ring-primary bg-[#F7FEFF]"
                            : "hover:shadow-xl"
                        }`}
                        onClick={() => handleJobClick(job)}
                      >
                        <div className="flex flex-col items-start gap-2">
                          <div className="flex gap-3 mb-1 items-center">
                            <Image
                              src={job.company?.logo ?? Logo}
                              alt={job.company?.name ?? "Company Logo"}
                              width={52}
                              height={52}
                              className="object-contain"
                            />
                            <div className="flex flex-col">
                              <h4 className="text-lg font-semibold">
                                {job.name ?? "Untitled position"}
                              </h4>
                              <div className="text-gray-500">
                                {job.company?.name ?? "Unknown Company"}
                              </div>
                            </div>
                          </div>
                          <hr className="border-gray-300 border-t w-full border-dashed" />
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <div className="text-sm text-gray-500 font-medium">
                              {job.company?.location ?? "Location not set"}
                            </div>
                          </div>
                          {((job.min_sal ?? 0) > 0 ||
                            (job.max_sal ?? 0) > 0) && (
                            <div className="flex items-center gap-1">
                              <Banknote className="w-4 h-4 text-gray-500" />
                              <div className="text-gray-500 font-medium text-sm">
                                {(job.min_sal ?? 0) > 0 &&
                                (job.max_sal ?? 0) > 0 ? (
                                  <>
                                    Rp{job.min_sal.toLocaleString()} - Rp
                                    {job.max_sal.toLocaleString()}
                                  </>
                                ) : (job.min_sal ?? 0) > 0 ? (
                                  <>Rp{job.min_sal.toLocaleString()}</>
                                ) : (
                                  <>Rp{job.max_sal?.toLocaleString()}</>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Detail Job (desktop only) */}
              <div className="hidden md:block md:col-span-5">
                {selectedJob ? (
                  <div className="bg-card rounded-xl p-6 min-h-[800px] border-2">
                    <div className="w-full space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-6 items-start">
                          <Image
                            src={Logo}
                            alt="Company Logo"
                            className="w-16 h-16 object-contain"
                          />
                          <div className="space-y-1">
                            <h2 className="text-base text-white font-medium w-fit bg-success px-2 py-1 rounded-md mb-2">
                              {selectedJob.type ?? "Untitled position"}
                            </h2>
                            <h2 className="text-2xl text-secondaryText font-semibold">
                              {selectedJob.name ?? "Untitled position"}
                            </h2>
                            <h2 className="text-base text-gray-500 font-normal">
                              {selectedJob.company?.name ?? "Rakamin"}
                            </h2>
                          </div>
                        </div>
                        <Button
                          label={
                            appliedJobs.includes(selectedJob.id)
                              ? "Already Applied"
                              : "Apply"
                          }
                          variant="secondary"
                          onClick={() => handleChangePage(selectedJob.id)}
                          disabled={appliedJobs.includes(selectedJob.id)}
                          className={
                            appliedJobs.includes(selectedJob.id)
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }
                        />
                      </div>

                      <hr className="border-gray-300 border-t my-4" />

                      <div className="text-sm text-secondaryText">
                        <p className="whitespace-pre-line text-base">
                          {selectedJob.desc ?? "No description provided."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card rounded-xl p-6 flex items-center justify-center border-2">
                    <p className="text-gray-500">
                      Pilih job dari daftar untuk melihat detail.
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile modal */}
              {showMobileModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center md:hidden">
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={closeModal}
                  />
                  <div className="relative w-full max-w-xl mt-20 mx-4 bg-card rounded-xl p-4 overflow-auto max-h-[80vh] border-2">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={closeModal}
                        className="flex items-center gap-2 text-sm text-gray-500"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <Button
                        label={
                          appliedJobs.includes(selectedJob.id)
                            ? "Already Applied"
                            : "Apply"
                        }
                        variant="secondary"
                        onClick={() =>
                          selectedJob && handleChangePage(selectedJob.id)
                        }
                        disabled={appliedJobs.includes(selectedJob.id)}
                        className={
                          appliedJobs.includes(selectedJob.id)
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-4 items-center">
                        <Image
                          src={selectedJob.company?.logo ?? Logo}
                          alt={selectedJob.company?.name ?? "Company Logo"}
                          width={56}
                          height={56}
                          className="object-contain rounded"
                        />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {selectedJob.name}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {selectedJob.company?.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-secondaryText">
                        <p className="whitespace-pre-line">
                          {selectedJob.desc ?? "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedJob.company?.location ?? "Location not set"}
                        </div>
                        {((selectedJob.min_sal ?? 0) > 0 ||
                          (selectedJob.max_sal ?? 0) > 0) && (
                          <div className="flex items-center gap-1">
                            <Banknote className="w-4 h-4" />
                            <div>
                              {(selectedJob.min_sal ?? 0) > 0 &&
                              (selectedJob.max_sal ?? 0) > 0 ? (
                                <>
                                  Rp{selectedJob.min_sal.toLocaleString()} - Rp
                                  {selectedJob.max_sal.toLocaleString()}
                                </>
                              ) : (selectedJob.min_sal ?? 0) > 0 ? (
                                <>Rp{selectedJob.min_sal.toLocaleString()}</>
                              ) : (
                                <>Rp{selectedJob.max_sal?.toLocaleString()}</>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default JobListContent;
