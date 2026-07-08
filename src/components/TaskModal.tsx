import { useEffect, useState } from "react";
import type { Task, TaskDraft } from "../types/task";
import { OWNERS, PRIORITIES, STATUSES, TASK_TYPES } from "../types/task";

const EMPTY: TaskDraft = {
  task: "",
  assignmentDate: null,
  priority: "P1",
  owner: OWNERS[0],
  status: "Not started",
  taskType: "Feature Addition",
  startDate: null,
  endDate: null,
  milestone: "",
  deliverable: "",
  notes: "",
};

export function TaskModal({
  open,
  onClose,
  onSave,
  onDelete,
  initial,
  knownOwners,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
  onDelete?: () => void;
  initial?: Task | null;
  knownOwners: string[];
}) {
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : EMPTY);
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  function set<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!draft.task.trim()) {
      setError("Task title is required.");
      return;
    }
    onSave({ ...draft, task: draft.task.trim() });
    onClose();
  }

  const owners = Array.from(new Set([...OWNERS, ...knownOwners].filter(Boolean)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">
            {initial ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Task title
            </label>
            <input
              autoFocus
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={draft.task}
              onChange={(e) => set("task", e.target.value)}
              placeholder="e.g. Fix pipeline retry logic"
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Owner</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.owner}
                onChange={(e) => set("owner", e.target.value)}
              >
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.status}
                onChange={(e) => set("status", e.target.value as Task["status"])}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.priority}
                onChange={(e) => set("priority", e.target.value as Task["priority"])}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Task type
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.taskType}
                onChange={(e) => set("taskType", e.target.value as Task["taskType"])}
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Assignment date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.assignmentDate ?? ""}
                onChange={(e) => set("assignmentDate", e.target.value || null)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Start date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.startDate ?? ""}
                onChange={(e) => set("startDate", e.target.value || null)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                End date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={draft.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || null)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Milestone
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={draft.milestone}
              onChange={(e) => set("milestone", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Deliverable
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={draft.deliverable}
              onChange={(e) => set("deliverable", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          {initial && onDelete ? (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Delete task
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {initial ? "Save changes" : "Create task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
