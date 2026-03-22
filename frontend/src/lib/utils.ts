import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd-MM-yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateFull(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "PPP");
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toUpperCase()) {
    case "EASY": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "MODERATE": return "bg-amber-50 text-amber-700 border-amber-200";
    case "HARD": return "bg-rose-50 text-rose-700 border-rose-200";
    default: return "bg-surface-100 text-surface-600 border-surface-200";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED": return "bg-emerald-50 text-emerald-700";
    case "GENERATING": return "bg-blue-50 text-blue-700";
    case "FAILED": return "bg-rose-50 text-rose-700";
    case "DRAFT": return "bg-surface-100 text-surface-600";
    default: return "bg-surface-100 text-surface-600";
  }
}

export function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MCQ: "Multiple Choice",
    SHORT_ANSWER: "Short Answer",
    LONG_ANSWER: "Long Answer",
    NUMERICAL: "Numerical",
    DIAGRAM_BASED: "Diagram/Graph",
    TRUE_FALSE: "True / False",
    FILL_IN_THE_BLANK: "Fill in the Blank",
  };
  return labels[type] || type;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
