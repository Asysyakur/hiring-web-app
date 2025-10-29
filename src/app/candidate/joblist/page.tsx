"use client";

import { Suspense } from "react";
import JobListContent from "./JobListContent";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function JobListPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="text-center mt-10">Loading jobs...</div>}>
        <JobListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
