"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAssignmentStore } from "@/store/assignmentStore";
import { assignmentsApi, libraryApi } from "@/lib/api";
import { downloadBlob, formatDateFull } from "@/lib/utils";
import GenerationProgress from "@/components/assignment/GenerationProgress";
import QuestionPaper from "@/components/assignment/QuestionPaper";
import {
  Download, RefreshCw, BookmarkPlus, Sparkles,
  Loader2, X, Send, Clock, Hash, Award
} from "lucide-react";

export default function AssignmentDetailInner() {
  const { id }           = useParams<{ id: string }>();
  const searchParams     = useSearchParams();
  const router           = useRouter();
  const { currentAssignment, fetchAssignment, isLoading } = useAssignmentStore();

  const jobIdParam       = searchParams.get("jobId");
  const isGeneratingParam = searchParams.get("generating") === "true";

  const [activeJobId, setActiveJobId] = useState<string | null>(jobIdParam);
  const [downloading, setDownloading] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [refineOpen,  setRefineOpen]  = useState(false);
  const [refinePrompt,setRefinePrompt]= useState("");
  const [refining,    setRefining]    = useState(false);
  const [regenerating,setRegenerating]= useState(false);

  useEffect(() => { if (id) fetchAssignment(id); }, [id, fetchAssignment]);

  useEffect(() => {
    if (!isGeneratingParam || !id) return;
    const interval = setInterval(async () => {
      await fetchAssignment(id);
      const a = useAssignmentStore.getState().currentAssignment;
      if (a?.status === "COMPLETED" || a?.status === "FAILED") {
        clearInterval(interval);
        router.replace(`/dashboard/assignments/${id}`);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isGeneratingParam, id, fetchAssignment, router]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await assignmentsApi.downloadPdf(id);
      downloadBlob(res.data, `${currentAssignment?.title ?? "assignment"}.pdf`);
      toast.success("PDF downloaded!");
    } catch { toast.error("Failed to download PDF"); }
    finally { setDownloading(false); }
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate this paper? Current content will be replaced.")) return;
    setRegenerating(true);
    try {
      const res = await assignmentsApi.generate(id);
      setActiveJobId(res.data.jobId);
      toast.success("Regeneration started!");
      router.replace(`/dashboard/assignments/${id}?jobId=${res.data.jobId}&generating=true`);
    } catch { toast.error("Failed to start regeneration"); }
    finally { setRegenerating(false); }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim()) return toast.error("Please enter refinement instructions");
    setRefining(true);
    try {
      const res = await assignmentsApi.refine(id, refinePrompt);
      setActiveJobId(res.data.jobId);
      setRefineOpen(false); setRefinePrompt("");
      toast.success("Refinement started!");
      router.replace(`/dashboard/assignments/${id}?jobId=${res.data.jobId}&generating=true`);
    } catch { toast.error("Failed to start refinement"); }
    finally { setRefining(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try { await libraryApi.save(id); toast.success("Saved to library!"); }
    catch { toast.error("Failed to save to library"); }
    finally { setSaving(false); }
  };

  const a = currentAssignment;
  const isCurrentlyGenerating =
    a?.status === "GENERATING" ||
    (isGeneratingParam && a?.status !== "COMPLETED" && a?.status !== "FAILED");

  if (isLoading && !a) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-5">
            <div className="h-4 skeleton rounded w-1/3 mb-3" />
            <div className="h-3 skeleton rounded w-full mb-2" />
            <div className="h-3 skeleton rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }
  if (!a) return <div className="p-6 text-center text-surface-500">Assignment not found.</div>;

  const statusCls = {
    COMPLETED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    GENERATING: "bg-blue-50 text-blue-700 border-blue-200",
    FAILED:     "bg-rose-50 text-rose-700 border-rose-200",
    DRAFT:      "bg-surface-100 text-surface-600 border-surface-200",
  }[a.status] ?? "bg-surface-100 text-surface-600 border-surface-200";

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">

      {/* Progress */}
      {isCurrentlyGenerating && activeJobId && (
        <GenerationProgress jobId={activeJobId} assignmentId={id} />
      )}

      {/* Meta card */}
      <div className="card p-4 sm:p-5 mb-4 sm:mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCls}`}>
                {a.status}
              </span>
              {a.status === "GENERATING" && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 size={11} className="animate-spin" /> Processing…
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-surface-900 leading-tight">{a.title}</h2>
            <p className="text-xs sm:text-sm text-surface-500 mt-1">
              {a.subject}{a.standardClass ? ` · Class ${a.standardClass}` : ""}
            </p>
          </div>

          {/* Actions — wrap on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
            {a.status === "COMPLETED" && (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white text-surface-800 text-xs font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <BookmarkPlus size={12} />}
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button onClick={() => setRefineOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white text-surface-800 text-xs font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-all">
                  <Sparkles size={12} className="text-purple-500" />
                  <span className="hidden sm:inline">Refine</span>
                </button>
                <button onClick={handleDownload} disabled={downloading}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-surface-900 text-white text-xs font-semibold rounded-xl hover:bg-surface-800 transition-all disabled:opacity-50">
                  {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </>
            )}
            {(a.status === "COMPLETED" || a.status === "FAILED" || a.status === "DRAFT") && (
              <button onClick={handleRegenerate} disabled={regenerating}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white text-surface-800 text-xs font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-all disabled:opacity-50">
                {regenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats row — 2 cols on mobile, 4 on sm */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-5 gap-2 mt-4 pt-4 border-t border-surface-100 text-xs sm:text-sm flex-wrap">
          {[
            { icon: Hash,  label: "Questions", value: a.numberOfQuestions },
            { icon: Award, label: "Marks",     value: a.totalMarks },
            { icon: Clock, label: "Duration",  value: a.timeAllowed },
            { icon: Clock, label: "Due",       value: a.dueDate ? formatDateFull(a.dueDate) : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={12} className="text-surface-400 shrink-0" />
              <span className="text-surface-500">{label}:</span>
              <span className="font-semibold text-surface-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Refine modal */}
      {refineOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-lg p-5 sm:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Sparkles size={14} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-surface-900 text-sm sm:text-base">Refine Question Paper</h3>
              </div>
              <button onClick={() => setRefineOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors">
                <X size={15} className="text-surface-500" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-surface-500 mb-4">
              Describe how you want to modify the paper. The AI will apply your changes.
            </p>
            <textarea
              className="w-full px-4 py-2.5 text-sm bg-white border border-surface-200 rounded-xl text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              rows={4}
              placeholder='e.g. "Add 2 more MCQ questions" or "Make hard questions more challenging"'
              value={refinePrompt}
              onChange={e => setRefinePrompt(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 sm:gap-3 mt-4">
              <button onClick={() => setRefineOpen(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-surface-800 text-sm font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-all">
                Cancel
              </button>
              <button onClick={handleRefine} disabled={refining || !refinePrompt.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50">
                {refining ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {refining ? "Refining…" : "Apply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated paper */}
      {a.status === "COMPLETED" && a.sections && a.sections.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Generated Question Paper</h3>
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors">
              <Download size={12} /> <span className="hidden sm:inline">Download as PDF</span>
            </button>
          </div>
          <QuestionPaper assignment={a} />
        </div>
      )}

      {/* Draft */}
      {a.status === "DRAFT" && !isCurrentlyGenerating && (
        <div className="card p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-surface-400" />
          </div>
          <h3 className="font-semibold text-surface-900 mb-2 text-sm sm:text-base">No paper generated yet</h3>
          <p className="text-xs sm:text-sm text-surface-500 mb-5 max-w-xs mx-auto">
            Click the button below to start AI generation.
          </p>
          <button onClick={handleRegenerate} disabled={regenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-all mx-auto">
            {regenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate Question Paper
          </button>
        </div>
      )}

      {/* Failed */}
      {a.status === "FAILED" && !isCurrentlyGenerating && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <X size={20} className="text-rose-500" />
          </div>
          <h3 className="font-semibold text-rose-900 mb-1 text-sm sm:text-base">Generation Failed</h3>
          <p className="text-xs sm:text-sm text-rose-600 mb-4">
            The AI could not generate the paper. Please try again.
          </p>
          <button onClick={handleRegenerate} disabled={regenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-all mx-auto">
            {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
