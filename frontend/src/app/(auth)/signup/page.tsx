"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", institution: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Please fill required fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await authApi.signup(form.name, form.email, form.password, form.institution);
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Signup failed";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-orange-50/30 to-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-surface-900 rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <span className="text-xl sm:text-2xl">✦</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">VedaAI</h1>
          <p className="mt-1 text-surface-500 text-xs sm:text-sm">Start creating smarter assessments</p>
        </div>
        <div className="card p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 mb-5 sm:mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name <span className="text-rose-500">*</span></label>
              <input className="input" placeholder="Dr. Priya Sharma" value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
              <input type="email" className="input" placeholder="teacher@school.edu" value={form.email} onChange={e => set("email", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Password <span className="text-rose-500">*</span></label>
              <input type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={e => set("password", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Institution <span className="text-surface-400 text-xs">(optional)</span></label>
              <input className="input" placeholder="e.g. Delhi Public School, Bokaro" value={form.institution} onChange={e => set("institution", e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="text-center text-xs sm:text-sm text-surface-500 mt-5 sm:mt-6">
            {"Already have an account? "}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
