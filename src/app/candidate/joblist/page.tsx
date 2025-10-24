"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Logo from "@/assets/Logo.svg";
import EmptyState from "@/assets/Empty State.svg";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import CardSkeleton from "@/components/CardSkeleton";
import { useRouter } from "next/navigation";

const JobListPage: React.FC = () => {
  const [jobs, setJobs] = useState<Jobs[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("jobs").select("*");
      if (error) throw error;
      setJobs(data ?? []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (jobId: string) => {
    router.push(`/candidate/joblist/applyjob/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-primaryBg transition-colors duration-500">
      <Navbar pageName="Job List" />
      <main className="p-8 flex w-full items-center justify-center">
        {/* Main Content Section */}
        <section className="w-full px-16">
          {loading ? (
            <div className="mt-8 space-y-4 flex flex-col w-full">
              {[1, 2, 3].map((key) => (
                <CardSkeleton key={key} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            // Empty State Section
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
            // Jobs List Section
            <>
              {(() => {
                const JobsWithDetails: React.FC<{ jobs: any[] }> = ({
                  jobs,
                }) => {
                  const [selectedJob, setSelectedJob] = useState<any>(
                    jobs[0] ?? null
                  );

                  return (
                    <div className="grid grid-cols-8 gap-8 px-16 w-full">
                      <div className="col-span-3">
                        <ul className="space-y-4">
                          {jobs.map((job: any) => {
                            const isSelected = selectedJob?.id === job.id;
                            return (
                              <li
                                key={job.id ?? JSON.stringify(job)}
                                className={`bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? "ring-2 ring-primary"
                                    : "hover:shadow-xl"
                                }`}
                                onClick={() => setSelectedJob(job)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <div className="flex gap-3 mb-1 items-center">
                                      <div className="text-success bg-success bg-opacity-5 border border-successBorder w-fit font-bold px-3 py-1 rounded-lg text-xs">
                                        Active
                                      </div>
                                      <div className="text-gray-500 border border-gray-300 w-fit font-medium px-3 py-1 rounded-md text-xs">
                                        started on{" "}
                                        {job.created_at
                                          ? new Date(
                                              job.created_at
                                            ).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                            })
                                          : "Unknown"}
                                      </div>
                                    </div>

                                    <h4 className="text-lg font-semibold">
                                      {job.name ?? "Untitled position"}
                                    </h4>

                                    {((job.min_sal ?? 0) > 0 ||
                                      (job.max_sal ?? 0) > 0) && (
                                      <div className="text-gray-500 font-medium text-sm">
                                        {(job.min_sal ?? 0) > 0 &&
                                        (job.max_sal ?? 0) > 0 ? (
                                          <>
                                            Rp{job.min_sal.toLocaleString()} -
                                            Rp
                                            {job.max_sal.toLocaleString()}
                                          </>
                                        ) : (job.min_sal ?? 0) > 0 ? (
                                          <>Rp{job.min_sal.toLocaleString()}</>
                                        ) : (
                                          <>Rp{job.max_sal?.toLocaleString()}</>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="col-span-5">
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
                                      {selectedJob.company ?? "Rakamin"}
                                    </h2>
                                  </div>
                                </div>
                                <div className="">
                                  <Button
                                    label="Apply"
                                    variant="secondary"
                                    onClick={() =>
                                      handleChangePage(selectedJob.id)
                                    }
                                  />
                                </div>
                              </div>

                              <hr className="border-gray-300 border-t my-4" />

                              <div className="text-sm text-secondaryText">
                                <p className="whitespace-pre-line text-base line">
                                  {selectedJob.desc ??
                                    "No description provided."}
                                </p>
                              </div>

                              <div className="flex gap-3 mt-4"></div>
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
                    </div>
                  );
                };

                return <JobsWithDetails jobs={jobs} />;
              })()}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default JobListPage;
