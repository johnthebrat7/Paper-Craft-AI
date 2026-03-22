import type { Assignment } from "@/types";
import { getDifficultyColor } from "@/lib/utils";

interface Props { assignment: Assignment; }

export default function QuestionPaper({ assignment }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden print:shadow-none print:border-none">
      {/* Paper header */}
      <div className="bg-surface-900 text-white px-4 sm:px-8 py-5 sm:py-6 text-center">
        <h1 className="text-base sm:text-xl font-bold tracking-tight">{assignment.schoolName}</h1>
        <p className="text-surface-300 mt-1 text-xs sm:text-sm">
          Subject: {assignment.subject}&nbsp;&nbsp;|&nbsp;&nbsp;Class: {assignment.standardClass}
        </p>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-2.5 sm:py-3 bg-surface-50 border-b border-surface-200 flex-wrap gap-2">
        <span className="text-xs sm:text-sm text-surface-600">
          <span className="font-medium">Time:</span> {assignment.timeAllowed}
        </span>
        <span className="text-xs sm:text-sm text-surface-600">
          <span className="font-medium">Max Marks:</span> {assignment.totalMarks}
        </span>
      </div>

      {/* Student info */}
      <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-surface-100">
        <p className="text-xs text-surface-400 mb-3 font-medium uppercase tracking-wider">
          All questions are compulsory unless stated otherwise.
        </p>
        {/* Stack on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 flex-wrap">
          {[
            { label: "Name",        width: "flex-1 sm:w-48" },
            { label: "Roll Number", width: "sm:w-32" },
            { label: "Section",     width: "sm:w-24" },
          ].map(({ label, width }) => (
            <div key={label} className={`flex items-end gap-2 ${width}`}>
              <span className="text-xs sm:text-sm font-medium text-surface-700 whitespace-nowrap shrink-0">{label}:</span>
              <div className="flex-1 border-b-2 border-surface-300 h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-6 sm:space-y-8">
        {assignment.sections?.map((section, si) => (
          <div key={si}>
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <h2 className="text-sm sm:text-base font-bold text-surface-900 shrink-0">{section.title}</h2>
              <div className="flex-1 h-px bg-surface-200" />
            </div>
            {section.instruction && (
              <p className="text-xs sm:text-sm italic text-surface-500 mb-3 sm:mb-4">{section.instruction}</p>
            )}

            <ol className="space-y-4 sm:space-y-5">
              {section.questions?.map((q, qi) => (
                <li key={qi}>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-surface-100 text-surface-600 text-xs font-bold shrink-0 mt-0.5">
                      {qi + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-surface-800 leading-relaxed">{q.questionText}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                        {q.difficulty && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase()}
                          </span>
                        )}
                        {q.questionType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-surface-50 text-surface-500 border-surface-200">
                            {q.questionType.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-surface-500 bg-surface-50 border border-surface-200 rounded-lg px-1.5 sm:px-2 py-1 shrink-0 whitespace-nowrap">
                      [{q.marks}M]
                    </span>
                  </div>
                  <div className="ml-7 sm:ml-9 mt-2 sm:mt-3 space-y-1.5">
                    <div className="h-px bg-surface-100 w-full" />
                    <div className="h-px bg-surface-100 w-full" />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-surface-50 border-t border-surface-200 text-center">
        <p className="text-xs text-surface-400 font-medium">*** END OF QUESTION PAPER ***</p>
      </div>
    </div>
  );
}
