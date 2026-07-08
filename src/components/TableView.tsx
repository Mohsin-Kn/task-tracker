import { useMemo, useState } from "react";
import type { Task } from "../types/task";
import { OWNERS, PRIORITIES, STATUSES } from "../types/task";
import { Avatar } from "./Avatar";
import { PRIORITY_STYLES, STATUS_STYLES } from "../utils/style";

type SortKey = "task" | "owner" | "priority" | "status" | "endDate";
type SortDir = "asc" | "desc";

function isOverdue(t: Task) {
  if (!t.endDate || t.status === "Completed") return false;
  return new Date(t.endDate) < new Date(new Date().toDateString());
}

export function TableView({
  tasks,
  owners,
  onEdit,
  onQuickUpdate,
  onDelete,
  onBulkDelete,
}: {
  tasks: Task[];
  owners: string[];
  onEdit: (task: Task) => void;
  onQuickUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("endDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allOwners = Array.from(new Set([...OWNERS, ...owners].filter(Boolean)));

  const sorted = useMemo(() => {
    const copy = [...tasks];
    copy.sort((a, b) => {
      let av: string = "";
      let bv: string = "";
      if (sortKey === "endDate") {
        av = a.endDate ?? "9999";
        bv = b.endDate ?? "9999";
      } else {
        av = String(a[sortKey] ?? "");
        bv = String(b[sortKey] ?? "");
      }
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [tasks, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === sorted.length ? new Set() : new Set(sorted.map((t) => t.id))
    );
  }

  const headerBtn = (label: string, key: SortKey) => (
    <button
      onClick={() => toggleSort(key)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
    >
      {label}
      {sortKey === key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-slate-600">No tasks match these filters.</p>
        <p className="mt-1 text-sm text-slate-400">Try clearing a filter or add a new task.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-auto">
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-5 py-2 text-sm">
          <span className="font-medium text-indigo-700">{selected.size} selected</span>
          <button
            onClick={() => {
              onBulkDelete(Array.from(selected));
              setSelected(new Set());
            }}
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            Delete selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-slate-500 hover:text-slate-700"
          >
            Clear selection
          </button>
        </div>
      )}
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="w-10 px-4 py-2">
              <input
                type="checkbox"
                checked={selected.size === sorted.length && sorted.length > 0}
                onChange={toggleAll}
              />
            </th>
            <th className="px-3 py-2">{headerBtn("Task", "task")}</th>
            <th className="px-3 py-2">{headerBtn("Owner", "owner")}</th>
            <th className="px-3 py-2">{headerBtn("Priority", "priority")}</th>
            <th className="px-3 py-2">{headerBtn("Status", "status")}</th>
            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </th>
            <th className="px-3 py-2">{headerBtn("Due", "endDate")}</th>
            <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Milestone
            </th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr
              key={t.id}
              className={`border-b border-slate-100 hover:bg-slate-50 ${
                isOverdue(t) ? "bg-rose-50/50" : ""
              }`}
            >
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                />
              </td>
              <td className="max-w-xs px-3 py-2">
                <button
                  onClick={() => onEdit(t)}
                  className="text-left font-medium text-slate-800 hover:text-indigo-600"
                >
                  {t.task}
                </button>
              </td>
              <td className="px-3 py-2">
                <select
                  value={t.owner}
                  onChange={(e) => onQuickUpdate(t.id, { owner: e.target.value })}
                  className="flex items-center gap-2 rounded-md border-none bg-transparent py-1 text-sm hover:bg-slate-100"
                >
                  <option value="">Unassigned</option>
                  {allOwners.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <select
                  value={t.priority}
                  onChange={(e) =>
                    onQuickUpdate(t.id, { priority: e.target.value as Task["priority"] })
                  }
                  className={`rounded-full border-none px-2 py-1 text-xs font-medium ${PRIORITY_STYLES[t.priority]}`}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <select
                  value={t.status}
                  onChange={(e) =>
                    onQuickUpdate(t.id, { status: e.target.value as Task["status"] })
                  }
                  className={`rounded-full border-none px-2 py-1 text-xs font-medium ${STATUS_STYLES[t.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 text-slate-500">{t.taskType}</td>
              <td className="px-3 py-2">
                <span className={isOverdue(t) ? "font-medium text-rose-600" : "text-slate-500"}>
                  {t.endDate ?? "—"}
                  {isOverdue(t) && " ⚠"}
                </span>
              </td>
              <td className="max-w-xs truncate px-3 py-2 text-slate-500" title={t.milestone}>
                {t.milestone || "—"}
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Avatar name={t.owner} />
                  <button
                    onClick={() => onDelete(t.id)}
                    className="text-slate-300 hover:text-rose-500"
                    aria-label="Delete task"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
