"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import EmptyStateFile from "@/assets/Empty State File.svg";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Job {
  id: string;
  name: string;
  title?: string;
  description?: string;
  min_sal?: number;
  max_sal?: number;
  created_at?: string;
}

const ManageJobPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <ProtectedRoute>
      <div className="min-h-screen bg-primaryBg transition-colors duration-500">
        <Navbar
          pageName="Manage Job"
          pageBefore="Job List"
          pathBack={`/admin/joblist`}
        />
        <main className="p-6 flex flex-col">
          {!id && (
            <p className="text-yellow-600">No job id provided in the route.</p>
          )}
          {loading && (
            <div className="flex flex-col">
              <div className="h-4 rounded-md bg-gray-200 animate-pulse w-1/6" />
              <div className="mt-8 border-2 rounded-lg p-6 bg-white">
                <div className="w-full min-h-[220px] md:min-h-[500px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-32">
                  <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse mb-4" />
                  <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          )}
          {error && <p className="mt-4 text-red-600">Error: {error}</p>}

          {job && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {job.name ?? "Untitled"}
              </h2>
              <section className="mt-8 border-2 rounded-lg p-6 bg-white">
                <div>
                  {!job ||
                  !(job as any).candidates ||
                  (job as any).candidates.length === 0 ? (
                    <div className="mt-8 w-full min-h-[220px] md:min-h-[500px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-32 text-center space-y-4">
                      <Image
                        src={EmptyStateFile}
                        alt="Empty state"
                        className="w-36 md:w-80 h-auto object-contain mb-2"
                      />
                      <h2 className="text-base md:text-xl font-semibold">
                        No candidates found
                      </h2>
                      <p className="text-sm md:text-base text-secondaryText max-w-xl px-4 pb-2">
                        Share your job vacancies so that more candidates will
                        apply.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              #
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Email
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Applied
                            </th>
                          </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                          {(job as any).candidates.map(
                            (c: any, idx: number) => (
                              <tr key={c.id ?? idx}>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {c.name ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {c.email ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      c.status === "hired"
                                        ? "bg-green-100 text-green-800"
                                        : c.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {c.status ?? "pending"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {c.applied_at
                                    ? new Date(
                                        c.applied_at
                                      ).toLocaleDateString()
                                    : "—"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ManageJobPage;
