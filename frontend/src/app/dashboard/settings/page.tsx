"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settingsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { User, Building, Mail, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { name: sName, institution: sInst, login, token, email: sEmail, roles } = useAuthStore();
  const [name,        setName]        = useState(sName || "");
  const [institution, setInstitution] = useState(sInst || "");
  const [saving,      setSaving]      = useState(false);

  useEffect(() => { setName(sName || ""); setInstitution(sInst || ""); }, [sName, sInst]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      await settingsApi.updateProfile(name, institution);
      if (token && sEmail) login(token, sEmail, name, institution, roles);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-surface-900">Settings</h2>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">Manage your account and preferences.</p>
      </div>

      <div className="card p-4 sm:p-6 mb-4 sm:mb-5">
        <h3 className="font-semibold text-surface-900 mb-4 sm:mb-5 flex items-center gap-2 text-sm sm:text-base">
          <User size={15} className="text-brand-500" /> Profile Information
        </h3>
        <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
              <Mail size={12} /> Email Address
            </label>
            <input className="input bg-surface-50 text-surface-500 cursor-not-allowed" value={sEmail || ""} disabled />
            <p className="text-xs text-surface-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
              <Building size={12} /> Institution
            </label>
            <input className="input" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. Delhi Public School, Bokaro" />
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="font-semibold text-surface-900 mb-3 sm:mb-4 text-sm sm:text-base">About VedaAI</h3>
        <div className="space-y-1.5 text-xs sm:text-sm text-surface-600">
          <p>AI-powered assessment creation platform for teachers.</p>
          <p>Spring Boot · Next.js · MongoDB · RabbitMQ · Redis · GPT-4o</p>
          <p className="text-xs text-surface-400 pt-2">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
