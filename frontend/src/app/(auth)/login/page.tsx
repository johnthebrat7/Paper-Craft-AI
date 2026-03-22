"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore(s => s.login);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token, email: userEmail, name, institution, roles } = res.data.data;
      login(token, userEmail, name, institution, roles);
      toast.success("Welcome back!");
      router.push("/dashboard/assignments");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-orange-50/30 to-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-surface-900 rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <span className="text-xl sm:text-2xl">✦</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">VedaAI</h1>
          <p className="mt-1 text-surface-500 text-xs sm:text-sm">AI-powered assessment creation</p>
        </div>
        <div className="card p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 mb-5 sm:mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input type="email" className="input" placeholder="teacher@school.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="text-center text-xs sm:text-sm text-surface-500 mt-5 sm:mt-6">
            {"Don't have an account? "}
            <Link href="/signup" className="text-brand-600 font-medium hover:text-brand-700">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
