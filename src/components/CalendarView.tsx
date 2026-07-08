import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type { Task } from "../types/task";
import { PRIORITY_STYLES, STATUS_DOT } from "../utils/style";

export function CalendarView({
  tasks,
  onEdit,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
}) {
  const [month, setMonth] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.endDate) continue;
      const list = map.get(t.endDate) ?? [];
      list.push(t);
      map.set(t.endDate, list);
    }
    return map;
  }, [tasks]);

  const undated = tasks.filter((t) => !t.endDate);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-700">{format(month, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            ‹
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Today
          </button>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-7 auto-rows-fr">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, month);
              return (
                <div
                  key={key}
                  className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${
                    inMonth ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      isToday(day)
                        ? "bg-indigo-600 font-semibold text-white"
                        : inMonth
                          ? "text-slate-500"
                          : "text-slate-300"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onEdit(t)}
                        className="block w-full truncate text-left text-[11px] hover:opacity-80"
                      >
                        <span
                          className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[t.status]}`}
                        />
                        <span className={`rounded px-1 py-0.5 ${PRIORITY_STYLES[t.priority]}`}>
                          {t.task}
                        </span>
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <p className="px-1 text-[10px] text-slate-400">
                        +{dayTasks.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {undated.length > 0 && (
          <aside className="w-64 shrink-0 overflow-y-auto border-l border-slate-200 bg-slate-50 p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              No due date ({undated.length})
            </h3>
            <div className="space-y-1.5">
              {undated.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onEdit(t)}
                  className="block w-full truncate rounded-md bg-white px-2 py-1.5 text-left text-xs text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
                >
                  {t.task}
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
