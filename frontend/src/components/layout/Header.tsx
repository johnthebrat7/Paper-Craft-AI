"use client";
import { usePathname } from "next/navigation";
import { Bell, ChevronLeft, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

const TITLES: Record<string, string> = {
  "/dashboard":                    "Home",
  "/dashboard/assignments":        "Assignments",
  "/dashboard/assignments/create": "Assignments",
  "/dashboard/groups":             "My Groups",
  "/dashboard/library":            "My Library",
  "/dashboard/ai-toolkit":         "AI Teacher's Toolkit",
  "/dashboard/settings":           "Settings",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { name }  = useAuthStore();

  const title    = TITLES[pathname]
    ?? TITLES[Object.keys(TITLES).find(k => pathname.startsWith(k) && k !== "/dashboard") ?? ""]
    ?? "VedaAI";
  const showBack = pathname !== "/dashboard" && pathname !== "/dashboard/assignments";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger – mobile only */}
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 transition-colors shrink-0">
          <Menu size={20} className="text-surface-600" />
        </button>

        {showBack && (
          <Link href="/dashboard/assignments"
            className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors shrink-0">
            <ChevronLeft size={18} className="text-surface-500" />
          </Link>
        )}

        <div className="flex items-center gap-2 min-w-0">
          {!showBack && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
          <h1 className="text-sm md:text-base font-semibold text-surface-900 truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 transition-colors">
          <Bell size={18} className="text-surface-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-surface-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {name ? name[0].toUpperCase() : "T"}
          </div>
          <span className="text-sm font-medium text-surface-800 hidden md:block truncate max-w-[120px]">
            {name || "Teacher"}
          </span>
        </div>
      </div>
    </header>
  );
}
