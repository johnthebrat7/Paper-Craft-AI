"use client";
import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Trash2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Assignment } from "@/types";

interface Props {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusBadge = {
    COMPLETED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    GENERATING: "bg-blue-50 text-blue-700 border-blue-200",
    FAILED:     "bg-rose-50 text-rose-700 border-rose-200",
    DRAFT:      "bg-surface-100 text-surface-600 border-surface-200",
  }[assignment.status] ?? "bg-surface-100 text-surface-600 border-surface-200";

  return (
    <div className="card p-4 sm:p-5 hover:shadow-card-hover transition-all duration-200 relative group animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-surface-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={15} className="text-surface-500" />
          </div>
          <div className="min-w-0">
            <Link href={`/dashboard/assignments/${assignment.id}`}>
              <h3 className="font-semibold text-surface-900 text-sm hover:text-brand-600 transition-colors leading-snug line-clamp-2 cursor-pointer">
                {assignment.title}
              </h3>
            </Link>
            {assignment.subject && (
              <p className="text-xs text-surface-400 mt-0.5 truncate">
                {assignment.subject}{assignment.standardClass ? ` · Class ${assignment.standardClass}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
            <MoreHorizontal size={15} className="text-surface-500" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white border border-surface-200 rounded-xl shadow-modal py-1.5 w-44 animate-slide-up">
                <Link href={`/dashboard/assignments/${assignment.id}`}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  <Eye size={14} className="text-surface-400" /> View Assignment
                </Link>
                <button onClick={() => { setMenuOpen(false); onDelete(assignment.id); }}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge}`}>
          {assignment.status}
        </span>
        {assignment.status === "GENERATING" && (
          <span className="flex items-center gap-1 text-xs text-blue-600">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Generating...
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-surface-400 pt-3 border-t border-surface-100 flex-wrap gap-1">
        <span>Assigned: {formatDate(assignment.createdAt)}</span>
        {assignment.dueDate && <span>Due: {formatDate(assignment.dueDate)}</span>}
      </div>
    </div>
  );
}
