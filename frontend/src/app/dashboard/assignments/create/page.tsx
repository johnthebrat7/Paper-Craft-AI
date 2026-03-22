"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, X, Upload, Calendar, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { assignmentsApi } from "@/lib/api";
import { getQuestionTypeLabel } from "@/lib/utils";
import type { QuestionType, QuestionTypeEntry } from "@/types";

const ALL_QT: QuestionType[] = [
  "MCQ","SHORT_ANSWER","LONG_ANSWER","NUMERICAL","DIAGRAM_BASED","TRUE_FALSE","FILL_IN_THE_BLANK"
];
const TIME_OPTIONS = ["30 minutes","45 minutes","1 hour","1.5 hours","2 hours","2.5 hours","3 hours"];
const STEPS = ["Details","Questions","Review"];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { email, institution } = useAuthStore();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);

  const [title, setTitle]               = useState("");
  const [subject, setSubject]           = useState("");
  const [standardClass, setStandardClass] = useState("");
  const [schoolName, setSchoolName]     = useState(institution || "");
  const [dueDate, setDueDate]           = useState("");
  const [timeAllowed, setTimeAllowed]   = useState("1 hour");
  const [description, setDescription]   = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeEntry[]>([
    { type: "MCQ", count: 4, marks: 1 },
  ]);

  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks     = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const addQT = () => {
    const used = questionTypes.map(q => q.type);
    const next = ALL_QT.find(t => !used.includes(t));
    if (!next) return toast.error("All question types already added");
    setQuestionTypes(prev => [...prev, { type: next, count: 3, marks: 2 }]);
  };

  const removeQT = (idx: number) => {
    if (questionTypes.length === 1) return toast.error("At least one question type required");
    setQuestionTypes(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQT = (idx: number, field: "type"|"count"|"marks", value: QuestionType|number) =>
    setQuestionTypes(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));

  const validate0 = () => {
    if (!title.trim())   { toast.error("Title is required");    return false; }
    if (!subject.trim()) { toast.error("Subject is required");  return false; }
    if (!dueDate)        { toast.error("Due date is required"); return false; }
    return true;
  };
  const validate1 = () => {
    if (questionTypes.some(q => q.count < 1))  { toast.error("Each type needs ≥ 1 question"); return false; }
    if (questionTypes.some(q => q.marks < 1))  { toast.error("Marks must be ≥ 1");            return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validate0()) return;
    if (step === 1 && !validate1()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title, description, teacherId: email!,
        dueDate: new Date(dueDate).toISOString(),
        questionTypes: questionTypes.map(q => q.type),
        numberOfQuestions: totalQuestions,
        marksPerQuestion: questionTypes[0]?.marks ?? 1,
        additionalInstructions,
        schoolName: schoolName || "N/A",
        subject, standardClass, timeAllowed,
      };
      const res  = await assignmentsApi.create(payload);
      const id   = res.data.id;
      toast.success("Assignment created! Starting generation…");
      const gen  = await assignmentsApi.generate(id);
      router.push(`/dashboard/assignments/${id}?jobId=${gen.data.jobId}&generating=true`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create assignment";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-surface-900">Create Assignment</h2>
        <p className="text-sm text-surface-500 mt-0.5">Set up a new assignment for your students.</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-6 sm:mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step  ? "bg-brand-500 text-white" :
                i === step? "bg-surface-900 text-white ring-4 ring-surface-900/10" :
                "bg-surface-200 text-surface-500"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? "text-surface-900" : "text-surface-400"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded mb-3 sm:mb-4 ${i < step ? "bg-brand-500" : "bg-surface-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Details ── */}
      {step === 0 && (
        <div className="card p-4 sm:p-6 space-y-4 sm:space-y-5 animate-slide-up">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-surface-900 mb-0.5">Assignment Details</h3>
            <p className="text-xs sm:text-sm text-surface-500">Basic information about your assignment.</p>
          </div>

          {/* File upload */}
          <div className="border-2 border-dashed border-surface-200 rounded-2xl p-6 sm:p-8 text-center hover:border-brand-300 transition-colors cursor-pointer bg-surface-50/50">
            <Upload size={22} className="text-surface-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-surface-600">Choose a file or drag &amp; drop</p>
            <p className="text-xs text-surface-400 mt-1">JPEG, PNG, PDF up to 10MB</p>
            <button className="mt-3 px-4 py-1.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-700 hover:bg-surface-50 transition-colors">
              Browse Files
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Due Date <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input type="date" className="input pr-10" value={dueDate} onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]} required />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            </div>
          </div>

          {/* 2-col on sm+, 1-col on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Title <span className="text-rose-500">*</span></label>
              <input className="input" placeholder="e.g. Quiz on Electricity" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Subject <span className="text-rose-500">*</span></label>
              <input className="input" placeholder="e.g. Science" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Class / Grade</label>
              <input className="input" placeholder="e.g. 8th Grade" value={standardClass} onChange={e => setStandardClass(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">School Name</label>
              <input className="input" placeholder="e.g. Delhi Public School" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Time Allowed <span className="text-rose-500">*</span></label>
            <select className="input" value={timeAllowed} onChange={e => setTimeAllowed(e.target.value)}>
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Description / Topic</label>
            <textarea className="input resize-none" rows={3}
              placeholder="e.g. Chapter 14 – Chemical Effects of Electric Current"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
      )}

      {/* ── Step 1: Question Setup ── */}
      {step === 1 && (
        <div className="card p-4 sm:p-6 animate-slide-up">
          <div className="mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-base font-semibold text-surface-900 mb-0.5">Question Setup</h3>
            <p className="text-xs sm:text-sm text-surface-500">Define types, count, and marks for your questions.</p>
          </div>

          {/* Column headers – hidden on mobile */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-3 mb-2 px-1">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Question Type</span>
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider w-28 text-center">No. of Questions</span>
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider w-20 text-center">Marks</span>
            <span className="w-7" />
          </div>

          <div className="space-y-3">
            {questionTypes.map((qt, idx) => (
              <div key={idx} className="bg-surface-50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-3 sm:items-center">
                <select className="input bg-white py-2 text-sm w-full"
                  value={qt.type} onChange={e => updateQT(idx, "type", e.target.value as QuestionType)}>
                  {ALL_QT.map(t => (
                    <option key={t} value={t} disabled={questionTypes.some((q, i) => i !== idx && q.type === t)}>
                      {getQuestionTypeLabel(t)}
                    </option>
                  ))}
                </select>

                {/* Mobile: side-by-side; Desktop: separate columns */}
                <div className="flex items-center justify-between sm:contents gap-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 sm:w-28 sm:justify-center">
                    <span className="text-xs text-surface-500 sm:hidden">Questions:</span>
                    <button onClick={() => updateQT(idx, "count", Math.max(1, qt.count - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors leading-none">−</button>
                    <span className="text-sm font-semibold text-surface-900 w-7 text-center">{qt.count}</span>
                    <button onClick={() => updateQT(idx, "count", qt.count + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors leading-none">+</button>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 sm:w-20 sm:justify-center">
                    <span className="text-xs text-surface-500 sm:hidden">Marks:</span>
                    <button onClick={() => updateQT(idx, "marks", Math.max(1, qt.marks - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors leading-none">−</button>
                    <span className="text-sm font-semibold text-surface-900 w-6 text-center">{qt.marks}</span>
                    <button onClick={() => updateQT(idx, "marks", qt.marks + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors leading-none">+</button>
                  </div>

                  <button onClick={() => removeQT(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-500 transition-colors sm:w-7">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addQT} className="mt-3 flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 font-medium transition-colors py-2">
            <div className="w-6 h-6 rounded-lg bg-surface-100 flex items-center justify-center"><Plus size={13} /></div>
            Add Question Type
          </button>

          <div className="mt-4 sm:mt-5 pt-4 border-t border-surface-100 flex justify-end gap-4 sm:gap-6 text-sm flex-wrap">
            <span className="text-surface-500">Total Questions: <span className="font-bold text-surface-900">{totalQuestions}</span></span>
            <span className="text-surface-500">Total Marks: <span className="font-bold text-surface-900">{totalMarks}</span></span>
          </div>

          <div className="mt-4 sm:mt-5">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Additional Instructions <span className="text-surface-400 text-xs">(optional)</span></label>
            <textarea className="input resize-none" rows={3}
              placeholder="e.g. Include questions from chapters 1-5 only."
              value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)} />
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <div className="card p-4 sm:p-6 animate-slide-up space-y-4 sm:space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-surface-900 mb-0.5">Review &amp; Create</h3>
            <p className="text-xs sm:text-sm text-surface-500">Confirm your assignment details before generating.</p>
          </div>

          <div className="bg-surface-50 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              {[
                { label: "Title",     value: title },
                { label: "Subject",   value: subject },
                { label: "Class",     value: standardClass || "—" },
                { label: "School",    value: schoolName || "—" },
                { label: "Due Date",  value: dueDate },
                { label: "Duration",  value: timeAllowed },
                { label: "Questions", value: totalQuestions },
                { label: "Marks",     value: totalMarks },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-surface-400 text-xs mb-0.5">{label}</p>
                  <p className="font-semibold text-surface-900 text-sm truncate">{value}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-surface-200">
              <p className="text-xs text-surface-400 mb-2">Question Types</p>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map(qt => (
                  <span key={qt.type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white border-surface-200 text-surface-700">
                    {getQuestionTypeLabel(qt.type)} × {qt.count} ({qt.marks}m)
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex gap-3">
            <span className="text-xl shrink-0">✦</span>
            <div>
              <p className="text-sm font-semibold text-surface-900">AI Generation</p>
              <p className="text-xs text-surface-600 mt-0.5">VedaAI will generate a structured question paper with sections, difficulty levels, and marks. You can refine it afterwards.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5 sm:mt-6">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-surface-800 text-sm font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-all disabled:opacity-0 disabled:pointer-events-none">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
        </button>

        {step < 2 ? (
          <button onClick={handleNext}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-surface-900 text-white text-sm font-semibold rounded-xl hover:bg-surface-800 transition-all">
            <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><span>✦</span> Create &amp; Generate</>}
          </button>
        )}
      </div>
    </div>
  );
}
