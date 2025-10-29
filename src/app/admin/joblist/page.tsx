"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import Button from "@/components/Form/Button";
import JobFormModal from "@/components/JobModalForm";
import CreateJobBg from "@/assets/CreateJobBG.jpg";
import EmptyState from "@/assets/Empty State.svg";
import Image from "next/image";
import CardSkeleton from "@/components/CardSkeleton";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { fetchJobsAdmin } from "@/features/jobSliceAdmin";
import type { RootState, AppDispatch } from "@/store";
import { Search } from "lucide-react";

const AdminJobListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.adminJobs);
  const { company, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
  }, [authLoading]);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchJobsAdmin(user.id));
  }, [user?.id, dispatch]);

  const handleChangePage = (jobId: string) => {
    router.push(`/admin/joblist/managejob/${jobId}`);
  };

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return jobs;
    return jobs.filter((job: any) => {
      const name = (job.name ?? "").toString().toLowerCase();
      const desc = (job.description ?? "").toString().toLowerCase();
      const location = (job.location ?? "").toString().toLowerCase();
      return (
        name.includes(term) || desc.includes(term) || location.includes(term)
      );
    });
  }, [jobs, searchTerm]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primaryBg transition-colors duration-500">
        <Navbar pageName="Job List" />
        <main className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-8 gap-6 md:gap-8 items-start">
          {/* CreateJob */}
          <section className="md:col-span-2 rounded-xl shadow p-4 sm:p-6 relative overflow-hidden md:hidden ">
            <div className="absolute inset-0">
              <Image
                src={CreateJobBg}
                alt="Create job background"
                fill
                className="object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 text-white">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                Recruit the best candidates
              </h2>
              <h3 className="font-medium text-sm sm:text-base">
                Create jobs, invite, and hire with ease
              </h3>
              <Button
                label="Create a new job"
                variant="primary"
                className="mt-4 w-full text-base"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </section>
          <section className="md:col-span-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by job details"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchTerm("");
                }}
                className="w-full border border-input rounded-lg p-3 sm:p-3.5 pr-12 text-sm sm:text-base bg-primaryBg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button
                type="button"
                aria-label="Search"
                onClick={() => {
                  /* optional: focus or trigger search; client-side filters instantly */
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 text-primary hover:text-primaryDark rounded-md transition"
              >
                <Search strokeWidth={3} size={18} />
              </button>
            </div>

            {loading ? (
              <div className="mt-6 sm:mt-8 space-y-4 flex flex-col w-full">
                {[1, 2, 3].map((key) => (
                  <CardSkeleton key={key} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="mt-6 sm:mt-8 w-full min-h-[220px] md:min-h-[360px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 text-center space-y-4">
                <Image
                  src={EmptyState}
                  alt="Empty state"
                  className="w-36 md:w-80 h-auto object-contain mb-2"
                />
                <h2 className="text-base sm:text-lg md:text-2xl font-semibold">
                  No job openings available
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-secondaryText max-w-xl px-4 pb-2">
                  Create a job opening now and start the candidate process.
                </p>
                <Button
                  label="Create a new job"
                  variant="secondary"
                  className="w-full md:w-auto text-base sm:text-lg"
                  onClick={() => setIsModalOpen(true)}
                />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="mt-6 sm:mt-8 w-full min-h-[220px] md:min-h-[360px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 text-center space-y-4">
                <h2 className="text-base sm:text-lg md:text-2xl font-semibold">
                  No results found
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-secondaryText max-w-xl px-4 pb-2">
                  Try a different keyword or clear the search.
                </p>
                <Button
                  label="Clear search"
                  variant="secondary"
                  className="w-full md:w-auto text-base sm:text-lg"
                  onClick={() => setSearchTerm("")}
                />
              </div>
            ) : (
              <div className="mt-6 sm:mt-8">
                <ul className="space-y-4">
                  {filteredJobs.map((job: any) => (
                    <li
                      key={job.id ?? JSON.stringify(job)}
                      className="bg-card rounded-lg p-4 sm:p-6 shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div className="space-y-2 w-full md:w-auto">
                          <div className="flex flex-wrap gap-3 items-center mb-1">
                            <div
                              className={`w-fit font-bold px-3 py-1 rounded-lg text-xs sm:text-sm border ${
                                job.status === "Active"
                                  ? "text-success border-success bg-success/5"
                                  : job.status === "Inactive"
                                  ? "text-destructive border-destructive bg-destructive/5"
                                  : job.status === "Draft"
                                  ? "text-secondary border-secondary bg-secondary/10"
                                  : "text-muted-foreground border-muted-foreground bg-muted-foreground/10"
                              }`}
                            >
                              {job.status ?? "Unknown Status"}
                            </div>
                            <div className="text-gray-500 border border-gray-300 w-fit font-medium px-3 py-1 rounded-md text-xs sm:text-sm">
                              started on{" "}
                              {job.created_at
                                ? new Date(job.created_at).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "Unknown"}
                            </div>
                          </div>
                          <h3 className="text-base sm:text-xl font-semibold break-words">
                            {job.name ?? "Untitled position"}
                          </h3>
                          {((job.min_sal ?? 0) > 0 ||
                            (job.max_sal ?? 0) > 0) && (
                            <div className="text-gray-500 font-medium text-sm sm:text-base">
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
                          )}
                        </div>

                        <div className="w-full md:w-auto flex md:block">
                          <Button
                            label="Manage Job"
                            variant="primary"
                            className="text-sm w-full md:w-auto"
                            onClick={() => handleChangePage(job.id)}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* CreateJob */}
          <section className="md:col-span-2 rounded-xl shadow p-4 sm:p-6 relative overflow-hidden hidden md:block">
            <div className="absolute inset-0">
              <Image
                src={CreateJobBg}
                alt="Create job background"
                fill
                className="object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 text-white">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                Recruit the best candidates
              </h2>
              <h3 className="font-medium text-sm sm:text-base">
                Create jobs, invite, and hire with ease
              </h3>
              <Button
                label="Create a new job"
                variant="primary"
                className="mt-4 w-full text-base"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </section>
        </main>

        <JobFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          companyId={company?.id || ""}
          userId={user?.id || ""}
        />
      </div>
    </ProtectedRoute>
  );
};

export default AdminJobListPage;
