"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobDetail } from "@/features/jobDetailSlice";
import type { RootState, AppDispatch } from "@/store";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import EmptyStateFile from "@/assets/Empty State File.svg";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";

const ManageJobPage = () => {
  const params = useParams();
  const id = params?.id as string | undefined;

  const dispatch = useDispatch<AppDispatch>();
  const { job, candidates, loading, error } = useSelector(
    (state: RootState) => state.jobDetails
  );

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [search, setSearch] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });

  // Columns
  const [columns, setColumns] = useState([
    { id: "fullName", label: "NAMA LENGKAP" },
    { id: "email", label: "EMAIL ADDRESS" },
    { id: "phone", label: "PHONE NUMBERS" },
    { id: "dob", label: "DATE OF BIRTH" },
    { id: "domicile", label: "DOMICILE" },
    { id: "gender", label: "GENDER" },
    { id: "linkedin", label: "LINK LINKEDIN" },
  ]);

  // Fetch data once
  useEffect(() => {
    if (id) {
      dispatch(fetchJobDetail(id));
    }
  }, [id, dispatch]);

  // Sorting logic
  const sortedCandidates = useMemo(() => {
    let sortable = [...candidates];
    if (sortConfig.key && sortConfig.direction) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [candidates, sortConfig]);

  const filtered = sortedCandidates.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(columns);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setColumns(reordered);
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-center text-red-600 mt-20">{error}</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          pageName="Manage Job"
          pageBefore="Job List"
          pathBack={`/admin/joblist`}
        />

        <main className="p-8">
          <h2 className="text-2xl font-semibold mb-6">
            {job?.name ?? "Untitled Job"}
          </h2>

          {/* Search */}
          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg w-64"
            />
            <p className="text-gray-600 text-sm">
              Showing {paginated.length} of {filtered.length} candidates
            </p>
          </div>

          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <Image
                src={EmptyStateFile}
                alt="Empty"
                width={150}
                height={150}
              />
              <h3 className="mt-4 text-lg font-semibold">
                No candidates found
              </h3>
              <p className="text-gray-500 text-sm">
                Share this job so more people can apply.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns" direction="horizontal">
                  {(provided) => (
                    <table
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-w-full text-sm"
                    >
                      <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                        <tr>
                          {columns.map((col, index) => (
                            <Draggable
                              key={col.id}
                              draggableId={col.id}
                              index={index}
                            >
                              {(prov) => (
                                <th
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className="px-6 py-3 text-left whitespace-nowrap select-none"
                                >
                                  <button
                                    onClick={() => handleSort(col.id)}
                                    className="flex items-center gap-1 font-semibold text-gray-700"
                                  >
                                    {col.label}
                                    <ArrowUpDown
                                      size={12}
                                      className="opacity-50"
                                    />
                                  </button>
                                </th>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {paginated.map((c) => (
                          <tr
                            key={c.id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            {columns.map((col) => (
                              <td
                                key={col.id}
                                className="px-6 py-4 text-gray-700 whitespace-nowrap"
                              >
                                {col.id === "linkedin" ? (
                                  <a
                                    href={c.linkedin}
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {c.linkedin?.slice(0, 30) + "..."}
                                  </a>
                                ) : col.id === "fullName" ? (
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 accent-blue-500"
                                    />
                                    <span className="font-medium">
                                      {c.fullName}
                                    </span>
                                  </div>
                                ) : (
                                  c[col.id] ?? "—"
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <p className="text-gray-600 text-sm">
              Page {page} of {Math.ceil(filtered.length / rowsPerPage)}
            </p>
            <button
              onClick={() =>
                setPage((p) =>
                  p < Math.ceil(filtered.length / rowsPerPage) ? p + 1 : p
                )
              }
              disabled={page === Math.ceil(filtered.length / rowsPerPage)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ManageJobPage;
