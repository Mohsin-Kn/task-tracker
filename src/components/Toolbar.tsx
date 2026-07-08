import { OWNERS, PRIORITIES, STATUSES, TASK_TYPES } from "../types/task";

export interface Filters {
  search: string;
  status: string;
  priority: string;
  owner: string;
  taskType: string;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  status: "",
  priority: "",
  owner: "",
  taskType: "",
};

export type ViewName = "table" | "board" | "calendar" | "dashboard";

export function Toolbar({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  owners,
  onAddTask,
  onExport,
  onImport,
}: {
  view: ViewName;
  onViewChange: (v: ViewName) => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  owners: string[];
  onAddTask: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  const allOwners = Array.from(new Set([...OWNERS, ...owners].filter(Boolean)));

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  const hasFilters =
    filters.status || filters.priority || filters.owner || filters.taskType || filters.search;

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
          <button
            onClick={() => onViewChange("table")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => onViewChange("board")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "board" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Board
          </button>
          <button
            onClick={() => onViewChange("calendar")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => onViewChange("dashboard")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "dashboard" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Dashboard
          </button>
        </div>

        <input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search tasks…"
          className="w-48 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />

        <select
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600 focus:border-indigo-400 focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => set("priority", e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600 focus:border-indigo-400 focus:outline-none"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filters.owner}
          onChange={(e) => set("owner", e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600 focus:border-indigo-400 focus:outline-none"
        >
          <option value="">All owners</option>
          {allOwners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          value={filters.taskType}
          onChange={(e) => set("taskType", e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600 focus:border-indigo-400 focus:outline-none"
        >
          <option value="">All types</option>
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => onFiltersChange(EMPTY_FILTERS)}
            className="text-sm font-medium text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onImport}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Import CSV
        </button>
        <button
          onClick={onExport}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Export CSV
        </button>
        <button
          onClick={onAddTask}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + New task
        </button>
      </div>
    </div>
  );
}
