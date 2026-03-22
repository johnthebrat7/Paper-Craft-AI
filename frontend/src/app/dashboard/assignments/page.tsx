"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Search, Plus, FileX, SlidersHorizontal } from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";
import AssignmentCard from "@/components/assignment/AssignmentCard";
import type { AssignmentStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: AssignmentStatus | "ALL" }[] = [
  { label: "All",       value: "ALL"       },
  { label: "Completed", value: "COMPLETED" },
  { label: "Generating",value: "GENERATING"},
  { label: "Draft",     value: "DRAFT"     },
  { label: "Failed",    value: "FAILED"    },
];

export default function AssignmentsPage() {
  const { assignments, isLoading, fetchAssignments, deleteAssignment } = useAssignmentStore();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "ALL">("ALL");
  const [filterOpen, setFilterOpen]   = useState(false);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    try { await deleteAssignment(id); toast.success("Assignment deleted"); }
    catch { toast.error("Failed to delete assignment"); }
  };

  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const SkeletonCard = () => (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 skeleton rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded-lg w-3/4" />
          <div className="h-3 skeleton rounded-lg w-1/2" />
        </div>
      </div>
      <div className="h-5 skeleton rounded-full w-20 mb-4" />
      <div className="h-3 skeleton rounded w-full" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-surface-900">Assignments</h2>
            <p className="text-xs text-surface-500 hidden sm:block">Manage and create assignments for your classes.</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {assignments.length > 0 && (
        <div className="mb-4 sm:mb-6 space-y-3">
          {/* Search + filter toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input className="input pl-8 py-2 text-sm" placeholder="Search assignments…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setFilterOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-surface-200 rounded-xl text-sm text-surface-600 bg-white hover:bg-surface-50 transition-colors shrink-0">
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Status filter chips */}
          {filterOpen && (
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? "bg-surface-900 text-white"
                      : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-5 sm:mb-6 relative">
            <div className="absolute inset-0 bg-surface-100 rounded-3xl rotate-6" />
            <div className="absolute inset-0 bg-white border-2 border-surface-200 rounded-3xl flex items-center justify-center">
              <FileX size={30} className="text-surface-300" />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-surface-900 mb-2">No assignments yet</h3>
          <p className="text-surface-500 text-sm max-w-sm mb-6 sm:mb-8">
            Create your first assignment to start generating AI-powered question papers.
          </p>
          <Link href="/dashboard/assignments/create" className="btn-primary">
            <Plus size={16} /> Create Your First Assignment
          </Link>
        </div>
      )}

      {/* No results */}
      {!isLoading && assignments.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search size={28} className="text-surface-300 mb-3" />
          <p className="text-surface-500 text-sm">No assignments match your search.</p>
          <button onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
            className="mt-3 text-brand-600 text-sm font-medium hover:text-brand-700">Clear filters</button>
        </div>
      )}

      {/* Grid – 1 col mobile, 2 col sm+ */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-24">
          {filtered.map(a => (
            <AssignmentCard key={a.id} assignment={a} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Floating create button */}
      {assignments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Link href="/dashboard/assignments/create"
            className="btn-primary shadow-lg hover:shadow-xl px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm">
            <Plus size={16} /> Create Assignment
          </Link>
        </div>
      )}
    </div>
  );
}
