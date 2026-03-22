"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { libraryApi } from "@/lib/api";
import type { LibraryItem } from "@/types";
import { BookOpen, Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function LibraryPage() {
  const [items,   setItems]   = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    libraryApi.getAll().then(r => setItems(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove from library?")) return;
    try { await libraryApi.delete(id); setItems(prev => prev.filter(i => i.id !== id)); toast.success("Removed"); }
    catch { toast.error("Failed to remove item"); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-surface-900">My Library</h2>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">Your saved question papers and templates.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-32 skeleton" />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-surface-300" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-1 text-sm sm:text-base">Your library is empty</h3>
          <p className="text-xs sm:text-sm text-surface-500 max-w-xs text-center">
            Save completed assignments to your library for easy reuse.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 sm:p-5 hover:shadow-card-hover transition-shadow group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={15} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-surface-500">{item.subject} · {item.standardClass}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100 text-xs text-surface-400">
                <span className="flex-1">Saved {formatDate(item.savedAt)}</span>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors">
                    <Eye size={13} className="text-surface-400" />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors">
                    <Trash2 size={13} className="text-surface-400 hover:text-rose-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
