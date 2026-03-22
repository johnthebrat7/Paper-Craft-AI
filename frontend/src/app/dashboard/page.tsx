"use client";
import { useEffect } from "react";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { FileText, Users, BookOpen, Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function DashboardHome() {
  const { assignments, fetchAssignments } = useAssignmentStore();
  const { name } = useAuthStore();

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const completed  = assignments.filter(a => a.status === "COMPLETED").length;
  const generating = assignments.filter(a => a.status === "GENERATING").length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-surface-900">
          {greeting()}, {name?.split(" ")[0] || "Teacher"} 👋
        </h2>
        <p className="text-surface-500 mt-1 text-sm">Here&apos;s what&apos;s happening with your assessments today.</p>
      </div>

      {/* Stats – 1 col mobile, 3 col md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Total Assignments", value: assignments.length, icon: FileText,     color: "text-brand-500",   bg: "bg-brand-50"   },
          { label: "Completed Papers",  value: completed,          icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "In Progress",       value: generating,         icon: Clock,        color: "text-blue-600",    bg: "bg-blue-50"    },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <TrendingUp size={14} className="text-surface-300" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-surface-900">{value}</p>
            <p className="text-xs sm:text-sm text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions – 1 col mobile, 2 col sm+ */}
      <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
        {[
          { href: "/dashboard/assignments/create", icon: Plus,     bg: "bg-surface-900 group-hover:bg-brand-500", iconColor: "text-white", label: "New Assignment",  sub: "Generate AI question paper" },
          { href: "/dashboard/groups",             icon: Users,    bg: "bg-surface-100 group-hover:bg-blue-100",  iconColor: "text-surface-600", label: "Manage Groups",   sub: "Organize your classes" },
          { href: "/dashboard/library",            icon: BookOpen, bg: "bg-surface-100 group-hover:bg-amber-100", iconColor: "text-surface-600", label: "My Library",      sub: "Saved question papers" },
          { href: "/dashboard/ai-toolkit",         icon: Sparkles, bg: "bg-surface-100 group-hover:bg-purple-100",iconColor: "text-surface-600", label: "AI Toolkit",      sub: "Smart teaching tools" },
        ].map(({ href, icon: Icon, bg, iconColor, label, sub }) => (
          <Link key={href} href={href} className="card p-4 sm:p-5 hover:shadow-card-hover transition-shadow group flex items-center gap-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center transition-colors shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-surface-900 text-sm">{label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent assignments */}
      {assignments.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Recent Assignments</h3>
            <Link href="/dashboard/assignments" className="text-xs text-brand-600 font-medium hover:text-brand-700">View all →</Link>
          </div>
          <div className="space-y-2">
            {assignments.slice(0, 3).map(a => (
              <Link key={a.id} href={`/dashboard/assignments/${a.id}`}
                className="card px-4 py-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
                <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-surface-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{a.title}</p>
                  <p className="text-xs text-surface-500 truncate">{a.subject}{a.standardClass ? ` · ${a.standardClass}` : ""}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                  a.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  a.status === "GENERATING"? "bg-blue-50 text-blue-700 border-blue-200" :
                  a.status === "FAILED"    ? "bg-rose-50 text-rose-700 border-rose-200" :
                  "bg-surface-100 text-surface-600 border-surface-200"}`}>
                  {a.status}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
