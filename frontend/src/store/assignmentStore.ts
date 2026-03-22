import { create } from "zustand";
import type { Assignment, JobStatusWsMessage } from "@/types";
import { assignmentsApi } from "@/lib/api";

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  generationProgress: Record<string, JobStatusWsMessage>;

  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  updateGenerationProgress: (jobId: string, msg: JobStatusWsMessage) => void;
  markCompleted: (assignmentId: string) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  currentAssignment: null,
  isLoading: false,
  error: null,
  generationProgress: {},

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await assignmentsApi.getAll();
      set({ assignments: res.data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch assignments";
      set({ error: message, isLoading: false });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await assignmentsApi.getById(id);
      set({ currentAssignment: res.data, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch assignment";
      set({ error: message, isLoading: false });
    }
  },

  deleteAssignment: async (id: string) => {
    await assignmentsApi.delete(id);
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    }));
  },

  updateGenerationProgress: (jobId: string, msg: JobStatusWsMessage) => {
    set((state) => ({
      generationProgress: { ...state.generationProgress, [jobId]: msg },
    }));
    // If completed or failed, refresh the assignment
    if (msg.status === "COMPLETED" || msg.status === "FAILED") {
      get().fetchAssignment(msg.assignmentId);
      // Also refresh list
      get().fetchAssignments();
    }
  },

  markCompleted: async (assignmentId: string) => {
    await get().fetchAssignment(assignmentId);
    await get().fetchAssignments();
  },
}));
