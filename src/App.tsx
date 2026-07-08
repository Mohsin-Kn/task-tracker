import { useMemo, useState } from "react";
import type { Task, TaskDraft } from "./types/task";
import { useTasks } from "./hooks/useTasks";
import { useToasts } from "./hooks/useToasts";
import { Toolbar, EMPTY_FILTERS, type Filters, type ViewName } from "./components/Toolbar";
import { TableView } from "./components/TableView";
import { BoardView } from "./components/BoardView";
import { CalendarView } from "./components/CalendarView";
import { DashboardView } from "./components/DashboardView";
import { TaskModal } from "./components/TaskModal";
import { ImportModal } from "./components/ImportModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ToastStack } from "./components/ToastStack";
import { tasksToCsv, downloadCsv } from "./utils/csv";

function KpiCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="flex-1 rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? "text-slate-800"}`}>{value}</p>
    </div>
  );
}

export default function App() {
  const {
    tasks,
    loading,
    mode,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    restoreTasks,
    importTasks,
  } = useTasks();
  const { toasts, push, dismiss } = useToasts();

  const [view, setView] = useState<ViewName>("table");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const owners = useMemo(() => Array.from(new Set(tasks.map((t) => t.owner).filter(Boolean))), [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.owner && t.owner !== filters.owner) return false;
      if (filters.taskType && t.taskType !== filters.taskType) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${t.task} ${t.milestone} ${t.deliverable} ${t.notes}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const kpis = useMemo(() => {
    const today = new Date(new Date().toDateString());
    const total = tasks.length;
    const open = tasks.filter((t) => t.status !== "Completed").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const overdue = tasks.filter(
      (t) => t.endDate && t.status !== "Completed" && new Date(t.endDate) < today
    ).length;
    return { total, open, completed, overdue };
  }, [tasks]);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setModalOpen(true);
  }

  function handleSave(draft: TaskDraft) {
    if (editing) {
      updateTask(editing.id, draft);
      push("Task updated");
    } else {
      addTask(draft);
      push("Task created");
    }
  }

  function handleDeleteRequest(id: string) {
    setConfirmDelete(id);
  }

  function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const removed = tasks.find((t) => t.id === confirmDelete);
    deleteTask(confirmDelete);
    setConfirmDelete(null);
    if (removed) {
      push("Task deleted", {
        label: "Undo",
        onClick: () => restoreTasks([removed]),
      });
    }
  }

  function handleBulkDelete(ids: string[]) {
    const removed = tasks.filter((t) => ids.includes(t.id));
    deleteTasks(ids);
    push(`${ids.length} task${ids.length === 1 ? "" : "s"} deleted`, {
      label: "Undo",
      onClick: () => restoreTasks(removed),
    });
  }

  function handleQuickUpdate(id: string, patch: Partial<Task>) {
    updateTask(id, patch);
  }

  function handleQuickAdd(status: Task["status"], title: string) {
    addTask({
      task: title,
      assignmentDate: null,
      priority: "P1",
      owner: "",
      status,
      taskType: "Feature Addition",
      startDate: null,
      endDate: null,
      milestone: "",
      deliverable: "",
      notes: "",
    });
    push("Task created");
  }

  function handleExport() {
    downloadCsv(`tasks-${new Date().toISOString().slice(0, 10)}.csv`, tasksToCsv(filtered));
  }

  function handleImport(drafts: TaskDraft[]) {
    const validDrafts = drafts.filter((d) => d.task.trim());
    if (validDrafts.length === 0) {
      push("No valid rows found in CSV");
      return;
    }
    importTasks(validDrafts);
    push(`Imported ${validDrafts.length} task${validDrafts.length === 1 ? "" : "s"}`);
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Task Tracker</h1>
            <p className="text-sm text-slate-400">Mobility Apps Studio</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              mode === "shared"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
            }`}
            title={
              mode === "shared"
                ? "Connected to Supabase — everyone with this link sees the same data live."
                : "Saved in this browser only. Add Supabase keys to share with your team."
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${mode === "shared" ? "bg-emerald-500" : "bg-slate-400"}`}
            />
            {mode === "shared" ? "Shared with team" : "Local only"}
          </span>
        </div>
        <div className="mt-4 flex gap-3">
          <KpiCard label="Total" value={kpis.total} />
          <KpiCard label="Open" value={kpis.open} accent="text-sky-600" />
          <KpiCard label="Completed" value={kpis.completed} accent="text-emerald-600" />
          <KpiCard label="Overdue" value={kpis.overdue} accent="text-rose-600" />
        </div>
      </header>

      <Toolbar
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        owners={owners}
        onAddTask={openNew}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
      />

      <main className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading tasks…
          </div>
        ) : view === "table" ? (
          <div className="h-full overflow-auto bg-white">
            <TableView
              tasks={filtered}
              owners={owners}
              onEdit={openEdit}
              onQuickUpdate={handleQuickUpdate}
              onDelete={handleDeleteRequest}
              onBulkDelete={handleBulkDelete}
            />
          </div>
        ) : view === "board" ? (
          <BoardView
            tasks={filtered}
            onEdit={openEdit}
            onQuickUpdate={handleQuickUpdate}
            onQuickAdd={handleQuickAdd}
          />
        ) : view === "calendar" ? (
          <div className="h-full bg-white">
            <CalendarView tasks={filtered} onEdit={openEdit} />
          </div>
        ) : (
          <DashboardView tasks={filtered} onSelectTask={openEdit} />
        )}
      </main>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={editing ? () => handleDeleteRequest(editing.id) : undefined}
        initial={editing}
        knownOwners={owners}
      />

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete task?"
        message="This can be undone right after deleting, but not later."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
