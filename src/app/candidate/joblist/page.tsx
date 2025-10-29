"use client";

import { Suspense } from "react";
import JobListContent from "./JobListContent";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";

export default function JobListPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading />}>
        <JobListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
