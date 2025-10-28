"use client";

import { useEffect, useState } from "react";
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
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.adminJobs);
  const { company } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchJobsAdmin());
    };
    fetchData();
  }, []);

  const handleChangePage = (jobId: string) => {
    router.push(`/admin/joblist/managejob/${jobId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primaryBg transition-colors duration-500">
        <Navbar pageName="Job List" />
        <main className="p-6 grid grid-cols-1 md:grid-cols-8 gap-8 items-start">
          <section className="md:col-span-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by job details"
                className="w-full border border-input rounded-lg p-3 pr-10 bg-primaryBg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button
                type="button"
                aria-label="Search"
                className="absolute right-2 mt-2 p-1 text-primary hover:text-primaryDark transition"
              >
                <Search strokeWidth={3} />
              </button>
            </div>

            {loading ? (
              <div className="mt-8 space-y-4 flex flex-col w-full">
                {[1, 2, 3].map((key) => (
                  <CardSkeleton key={key} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="mt-8 w-full min-h-[220px] md:min-h-[360px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 text-center space-y-4">
                <Image
                  src={EmptyState}
                  alt="Empty state"
                  className="w-36 md:w-80 h-auto object-contain mb-2"
                />
                <h2 className="text-lg md:text-2xl font-semibold">
                  No job openings available
                </h2>
                <p className="text-sm md:text-base text-secondaryText max-w-xl px-4 pb-2">
                  Create a job opening now and start the candidate process.
                </p>
                <Button
                  label="Create a new job"
                  variant="secondary"
                  className="w-full md:w-auto text-lg"
                  onClick={() => setIsModalOpen(true)}
                />
              </div>
            ) : (
              <div className="mt-8">
                <ul className="space-y-4">
                  {jobs.map((job: any) => (
                    <li
                      key={job.id ?? JSON.stringify(job)}
                      className="bg-card rounded-lg p-8 shadow-lg"
                    >
                      <div className="flex justify-between items-end ">
                        <div className="space-y-2">
                          <div className="flex gap-4 mb-1">
                            <div className="text-success bg-success-foreground bg-opacity-5 border border-success w-fit font-bold mb-1 px-4 py-1 rounded-lg">
                              Active
                            </div>
                            <div className="text-gray-500 border border-gray-300 w-fit font-medium mb-1 px-4 py-1 rounded-md">
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
                          <h3 className="text-xl font-semibold">
                            {job.name ?? "Untitled position"}
                          </h3>
                          {((job.min_sal ?? 0) > 0 ||
                            (job.max_sal ?? 0) > 0) && (
                            <div className="text-gray-500 font-medium">
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
                        <Button
                          label="Manage Job"
                          variant="primary"
                          className="text-sm"
                          onClick={() => handleChangePage(job.id)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <section className="md:col-span-2 rounded-xl shadow p-6 relative overflow-hidden">
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
              <h2 className="text-xl font-semibold mb-4">
                Recruit the best candidates
              </h2>
              <h3 className="font-medium">
                Create jobs, invite, and hire with ease
              </h3>
              <Button
                label="Create a new job"
                variant="primary"
                className="mt-6 w-full text-lg"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </section>
        </main>

        <JobFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          companyId={company?.id || ""}
        />
      </div>
    </ProtectedRoute>
  );
};

export default AdminJobListPage;
