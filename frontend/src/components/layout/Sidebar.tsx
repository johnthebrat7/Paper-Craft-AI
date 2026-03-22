"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Users, BookOpen,
  Sparkles, Settings, LogOut, ChevronDown, X, Menu
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { label: "Home",               href: "/dashboard",            icon: LayoutDashboard, exact: true },
  { label: "Assignments",        href: "/dashboard/assignments", icon: FileText },
  { label: "My Groups",          href: "/dashboard/groups",      icon: Users },
  { label: "AI Teacher's Toolkit", href: "/dashboard/ai-toolkit", icon: Sparkles },
  { label: "My Library",         href: "/dashboard/library",     icon: BookOpen },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { name, institution, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white text-base font-bold">V</span>
          </div>
          <span className="text-lg font-bold text-surface-900 tracking-tight">VedaAI</span>
        </div>
        {/* Close button – mobile only */}
        <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors">
          <X size={18} className="text-surface-500" />
        </button>
      </div>

      {/* Create CTA */}
      <div className="px-4 pt-4 pb-2">
        <Link href="/dashboard/assignments/create"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-surface-900 text-white text-sm font-semibold rounded-xl hover:bg-surface-800 transition-colors">
          <span className="text-brand-400">✦</span> Create Assignment
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon, exact }) => (
          <Link key={href} href={href} onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              isActive(href, exact)
                ? "bg-surface-100 text-surface-900 font-semibold"
                : "text-surface-500 hover:bg-surface-50 hover:text-surface-800"
            )}>
            <Icon size={17} className={isActive(href, exact) ? "text-brand-500" : "text-surface-400"} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-100 px-3 py-3 space-y-0.5">
        <Link href="/dashboard/settings" onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname.startsWith("/dashboard/settings")
              ? "bg-surface-100 text-surface-900"
              : "text-surface-500 hover:bg-surface-50 hover:text-surface-800"
          )}>
          <Settings size={17} className="text-surface-400" />
          Settings
        </Link>

        {/* Profile card */}
        <div className="mt-2 rounded-xl bg-surface-50 border border-surface-100 p-3">
          <button onClick={() => setProfileOpen(v => !v)} className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {name ? name[0].toUpperCase() : "T"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-surface-900 truncate">{name || "Teacher"}</p>
              <p className="text-xs text-surface-500 truncate">{institution || "School"}</p>
            </div>
            <ChevronDown size={14} className={cn("text-surface-400 transition-transform shrink-0", profileOpen && "rotate-180")} />
          </button>
          {profileOpen && (
            <div className="mt-2 pt-2 border-t border-surface-200">
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 h-screen sticky top-0 flex-col bg-white border-r border-surface-200 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-72 max-w-[85vw] h-full bg-white shadow-xl flex flex-col overflow-hidden animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
