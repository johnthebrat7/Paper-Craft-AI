"use client";
import { useState } from "react";
import { Sparkles, Send, Loader2, Download } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { downloadBlob } from "@/lib/utils";

const QUICK = [
  "Generate 10 MCQ questions on photosynthesis for Class 8",
  "Create a 20-mark short answer quiz on the French Revolution",
  "Write 5 numerical problems on Ohm's Law for Class 10",
  "Make a true/false quiz on human anatomy for Class 7",
];

export default function AIToolkitPage() {
  const { institution } = useAuthStore();
  const [prompt,   setPrompt]   = useState("");
  const [response, setResponse] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true); setResponse("");
    try {
      await new Promise(r => setTimeout(r, 1000));
      setResponse(`Here are customised questions for your ${institution || "school"} classes:\n\n${prompt}\n\n[AI-generated content will appear here once the /api/toolkit/generate endpoint is connected to your Spring AI service.]`);
    } catch { setResponse("Failed to generate. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-surface-900 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900">AI Teacher&apos;s Toolkit</h2>
          <p className="text-xs sm:text-sm text-surface-500">Generate custom content with AI assistance.</p>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="card mb-4 sm:mb-5 overflow-hidden animate-slide-up">
          <div className="bg-surface-900 px-4 sm:px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-brand-400" />
              <span className="text-white text-sm font-medium">AI Response</span>
            </div>
            <button onClick={() => downloadBlob(new Blob([response], { type: "text/plain" }), "ai-content.txt")}
              className="flex items-center gap-1 text-xs text-surface-400 hover:text-white transition-colors">
              <Download size={12} /> Download
            </button>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      )}

      {/* Quick prompts */}
      <div className="mb-4 sm:mb-5">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 sm:mb-3">Quick Prompts</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(p => (
            <button key={p} onClick={() => setPrompt(p)}
              className="px-3 py-1.5 bg-white border border-surface-200 rounded-xl text-xs text-surface-700 hover:border-brand-300 hover:text-brand-700 transition-colors text-left">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="card p-3 sm:p-4">
        <textarea
          className="w-full text-sm text-surface-800 resize-none border-none outline-none bg-transparent placeholder:text-surface-400 min-h-[70px] sm:min-h-[80px]"
          placeholder="Ask the AI to generate questions, rubrics, lesson plans…"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-surface-100">
          <span className="text-xs text-surface-400 hidden sm:block">Describe what you need</span>
          <button type="submit" disabled={loading || !prompt.trim()} className="btn-primary text-xs px-3 sm:px-4 py-2 ml-auto">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
