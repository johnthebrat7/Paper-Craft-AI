"use client";
import { useState } from "react";
import { Sparkles, Send, Loader2, Download } from "lucide-react";
import api from "@/lib/api";
import { downloadBlob } from "@/lib/utils";
import toast from "react-hot-toast";

const QUICK_PROMPTS = [
  "Generate 10 MCQ questions on photosynthesis for Class 8",
  "Create a 20-mark short answer quiz on the French Revolution",
  "Write 5 numerical problems on Ohm's Law for Class 10",
  "Make a true/false quiz on human anatomy for Class 7",
  "Create a rubric for evaluating a science project",
  "Generate a lesson plan for teaching fractions to Class 5",
];

export default function AIToolkitPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await api.post("/toolkit/generate", { prompt });
      setResponse(res.data.response);
    } catch {
      toast.error("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-surface-900 rounded-xl flex items-center justify-center">
          <Sparkles size={18} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-surface-900">AI Teacher&apos;s Toolkit</h2>
          <p className="text-sm text-surface-500">Generate custom content using AI assistance.</p>
        </div>
      </div>

      {/* Response area */}
      {response && (
        <div className="card mb-5 overflow-hidden animate-slide-up">
          <div className="bg-surface-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brand-400" />
              <span className="text-white text-sm font-medium">AI Response</span>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([response], { type: "text/plain" });
                downloadBlob(blob, "ai-content.txt");
              }}
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition-colors"
            >
              <Download size={12} /> Download
            </button>
          </div>
          <div className="p-5 bg-white">
            <p className="text-sm text-surface-700 leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      )}

      {/* Quick prompts */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Quick Prompts</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className="px-3 py-1.5 bg-white border border-surface-200 rounded-xl text-xs text-surface-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="card p-4">
        <textarea
          className="w-full text-sm text-surface-800 resize-none border-none outline-none bg-transparent placeholder:text-surface-400 min-h-[80px]"
          placeholder="Ask the AI to generate questions, rubrics, lesson plans, and more..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <span className="text-xs text-surface-400">⌘ + Enter to send</span>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-900 text-white text-xs font-semibold rounded-xl hover:bg-surface-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
