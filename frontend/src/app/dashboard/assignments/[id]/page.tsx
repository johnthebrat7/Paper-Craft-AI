"use client";
import { Suspense } from "react";
import AssignmentDetailInner from "./AssignmentDetailInner";

export default function AssignmentDetailPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="h-4 skeleton rounded w-1/3 mb-3" />
            <div className="h-3 skeleton rounded w-full mb-2" />
            <div className="h-3 skeleton rounded w-2/3" />
          </div>
        ))}
      </div>
    }>
      <AssignmentDetailInner />
    </Suspense>
  );
}
