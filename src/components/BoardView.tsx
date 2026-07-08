import { useState } from "react";
import type { Task } from "../types/task";
import { STATUSES } from "../types/task";
import { Avatar } from "./Avatar";
import { PRIORITY_STYLES, STATUS_DOT } from "../utils/style";

function isOverdue(t: Task) {
  if (!t.endDate || t.status === "Completed") return false;
  return new Date(t.endDate) < new Date(new Date().toDateString());
}

export function BoardView({
  tasks,
  onEdit,
  onQuickUpdate,
  onQuickAdd,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onQuickUpdate: (id: string, patch: Partial<Task>) => void;
  onQuickAdd: (status: Task["status"], title: string) => void;
}) {
  return (
    <div className="flex h-full gap-4 overflow-x-auto p-5">
      {STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <Column
            key={status}
            status={status}
            tasks={columnTasks}
            onEdit={onEdit}
            onQuickUpdate={onQuickUpdate}
            onQuickAdd={onQuickAdd}
          />
        );
      })}
    </div>
  );
}

function Column({
  status,
  tasks,
  onEdit,
  onQuickUpdate,
  onQuickAdd,
}: {
  status: Task["status"];
  tasks: Task[];
  onEdit: (task: Task) => void;
  onQuickUpdate: (id: string, patch: Partial<Task>) => void;
  onQuickAdd: (status: Task["status"], title: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function submit() {
    if (title.trim()) {
      onQuickAdd(status, title.trim());
      setTitle("");
    }
    setAdding(false);
  }

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-slate-50 ring-1 ring-slate-200 transition ${
        dragOver ? "ring-2 ring-indigo-300" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const id = e.dataTransfer.getData("text/task-id");
        if (id) onQuickUpdate(id, { status });
      }}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
          <h3 className="text-sm font-semibold text-slate-700">{status}</h3>
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-500">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/task-id", t.id)}
            onClick={() => onEdit(t)}
            className="cursor-pointer rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
          >
            <p className="text-sm font-medium text-slate-800">{t.task}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[t.priority]}`}
              >
                {t.priority}
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                {t.taskType}
              </span>
              {t.endDate && (
                <span
                  className={`text-[10px] ${
                    isOverdue(t) ? "font-medium text-rose-600" : "text-slate-400"
                  }`}
                >
                  {isOverdue(t) ? "⚠ " : ""}
                  due {t.endDate}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Avatar name={t.owner} />
              <select
                value={t.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onQuickUpdate(t.id, { status: e.target.value as Task["status"] })}
                className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {adding ? (
          <div className="rounded-lg bg-white p-2 ring-1 ring-indigo-200">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setAdding(false);
                  setTitle("");
                }
              }}
              onBlur={submit}
              placeholder="Task title…"
              className="w-full text-sm focus:outline-none"
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-lg border border-dashed border-slate-300 py-1.5 text-xs font-medium text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
