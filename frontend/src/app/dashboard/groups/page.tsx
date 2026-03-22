"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { groupsApi } from "@/lib/api";
import type { Group } from "@/types";
import { Users, Plus, X, UserPlus } from "lucide-react";

export default function GroupsPage() {
  const [groups,   setGroups]   = useState<Group[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ name: "", subject: "", standardClass: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    groupsApi.getAll().then(r => setGroups(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject) return toast.error("Name and subject required");
    setCreating(true);
    try {
      const res = await groupsApi.create(form.name, form.subject, form.standardClass);
      setGroups(prev => [...prev, res.data.data]);
      setModal(false); setForm({ name: "", subject: "", standardClass: "" });
      toast.success("Group created!");
    } catch { toast.error("Failed to create group"); }
    finally { setCreating(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900">My Groups</h2>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">Organise students into class groups.</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary text-sm">
          <Plus size={15} /> <span className="hidden sm:inline">New Group</span>
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-32 skeleton" />)}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} className="text-surface-300" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-1 text-sm sm:text-base">No groups yet</h3>
          <p className="text-xs sm:text-sm text-surface-500 mb-5 text-center max-w-xs">Create groups to organise your students by class or section.</p>
          <button onClick={() => setModal(true)} className="btn-primary"><Plus size={15} /> Create First Group</button>
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {groups.map(g => (
            <div key={g.id} className="card p-4 sm:p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Users size={16} className="text-blue-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-surface-900 text-sm truncate">{g.name}</h3>
                  <p className="text-xs text-surface-500">{g.subject} · {g.standardClass}</p>
                </div>
              </div>
              <div className="flex items-center text-xs text-surface-500 pt-3 border-t border-surface-100">
                <UserPlus size={11} className="mr-1" />{g.studentEmails?.length || 0} students
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-md p-5 sm:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900">Create New Group</h3>
              <button onClick={() => setModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Group Name *</label>
                <input className="input" placeholder="e.g. Section A – Morning" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Subject *</label>
                <input className="input" placeholder="e.g. Physics" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Class / Grade</label>
                <input className="input" placeholder="e.g. 10th Grade" value={form.standardClass} onChange={e => setForm(f => ({ ...f, standardClass: e.target.value }))} />
              </div>
              <div className="flex gap-2 sm:gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center">
                  {creating ? "Creating…" : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
