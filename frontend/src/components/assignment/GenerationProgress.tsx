"use client";
import { useEffect, useRef } from "react";
import { connectAndSubscribeToJob } from "@/lib/websocket";
import { useAssignmentStore } from "@/store/assignmentStore";
import type { JobStatusWsMessage } from "@/types";
import { Loader2 } from "lucide-react";

interface Props { jobId: string; assignmentId: string; }

const STEPS = [
  { label: "Metadata",  threshold: 10  },
  { label: "Prompt",    threshold: 25  },
  { label: "AI Call",   threshold: 50  },
  { label: "Saving",    threshold: 85  },
  { label: "Done",      threshold: 100 },
];

export default function GenerationProgress({ jobId, assignmentId }: Props) {
  const { generationProgress, updateGenerationProgress } = useAssignmentStore();
  const cleanupRef = useRef<(() => void) | null>(null);
  const progress = generationProgress[jobId];

  useEffect(() => {
    if (!jobId) return;
    const cleanup = connectAndSubscribeToJob(jobId, (msg: JobStatusWsMessage) => {
      updateGenerationProgress(jobId, msg);
    });
    cleanupRef.current = cleanup;
    return () => { cleanupRef.current?.(); };
  }, [jobId, assignmentId, updateGenerationProgress]);

  const percent = progress?.progress ?? 0;
  const message = progress?.message  ?? "Initialising AI generation…";
  const status  = progress?.status   ?? "GENERATING";

  if (status === "COMPLETED") return null;

  return (
    <div className="card p-4 sm:p-6 mb-4 sm:mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
          <Loader2 size={18} className="text-brand-500 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 text-sm">
            {status === "FAILED" ? "Generation Failed" : "AI is generating your question paper…"}
          </h3>
          <p className="text-xs text-surface-500 mt-0.5 truncate">{message}</p>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-surface-900 tabular-nums shrink-0">{percent}%</span>
      </div>

      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${
          status === "FAILED" ? "bg-rose-400" : "bg-gradient-to-r from-brand-400 to-brand-500"}`}
          style={{ width: `${percent}%` }} />
      </div>

      {status === "FAILED" && (
        <div className="mt-3 p-3 bg-rose-50 rounded-xl text-xs text-rose-600 font-medium">
          ⚠ Generation failed. Click &quot;Regenerate&quot; to try again.
        </div>
      )}

      {/* Step dots – hidden on small mobile */}
      <div className="hidden sm:flex items-center gap-3 sm:gap-4 mt-3 flex-wrap text-xs text-surface-400">
        {STEPS.map(({ label, threshold }) => (
          <div key={label} className={`flex items-center gap-1 ${percent >= threshold ? "text-emerald-600" : ""}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${percent >= threshold ? "bg-emerald-500" : "bg-surface-300"}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
