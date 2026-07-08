import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";
import type { Task } from "../types/task";
import { STATUSES } from "../types/task";

const STATUS_COLORS: Record<string, string> = {
  "Not started": "#94a3b8",
  "In progress": "#0ea5e9",
  Completed: "#10b981",
};

const OWNER_COLORS = ["#6366f1", "#14b8a6", "#f97316", "#3b82f6", "#ec4899", "#84cc16"];

export function DashboardView({
  tasks,
  onSelectTask,
}: {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}) {
  const statusData = useMemo(
    () =>
      STATUSES.map((s) => ({
        name: s,
        value: tasks.filter((t) => t.status === s).length,
      })).filter((d) => d.value > 0),
    [tasks]
  );

  const ownerData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) {
      const owner = t.owner || "Unassigned";
      counts.set(owner, (counts.get(owner) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([owner, count]) => ({ owner, count }));
  }, [tasks]);

  const trendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const created = tasks.filter((t) => t.createdAt.slice(0, 10) === key).length;
      const completed = tasks.filter(
        (t) => t.status === "Completed" && t.updatedAt.slice(0, 10) === key
      ).length;
      return { date: format(day, "MMM d"), created, completed };
    });
  }, [tasks]);

  const today = new Date(new Date().toDateString());
  const overdue = tasks
    .filter((t) => t.endDate && t.status !== "Completed" && parseISO(t.endDate) < today)
    .sort((a, b) => (a.endDate! < b.endDate! ? -1 : 1));
  const dueThisWeek = tasks
    .filter((t) => {
      if (!t.endDate || t.status === "Completed") return false;
      const d = parseISO(t.endDate);
      const weekOut = new Date(today);
      weekOut.setDate(weekOut.getDate() + 7);
      return d >= today && d <= weekOut;
    })
    .sort((a, b) => (a.endDate! < b.endDate! ? -1 : 1));

  if (tasks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-600">Nothing to chart yet.</p>
        <p className="mt-1 text-sm text-slate-400">Add a few tasks and this view fills in.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Status distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {statusData.map((d) => (
                  <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={24} iconSize={8} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Tasks per owner</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ownerData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="owner" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ownerData.map((d, i) => (
                  <Cell key={d.owner} fill={OWNER_COLORS[i % OWNER_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Created vs. completed (14 days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend iconSize={8} />
              <Line type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TaskList title={`Overdue (${overdue.length})`} tasks={overdue} onSelect={onSelectTask} tone="rose" />
        <TaskList
          title={`Due this week (${dueThisWeek.length})`}
          tasks={dueThisWeek}
          onSelect={onSelectTask}
          tone="sky"
        />
      </div>
    </div>
  );
}

function TaskList({
  title,
  tasks,
  onSelect,
  tone,
}: {
  title: string;
  tasks: Task[];
  onSelect: (t: Task) => void;
  tone: "rose" | "sky";
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <h3
        className={`mb-2 text-sm font-semibold ${tone === "rose" ? "text-rose-600" : "text-sky-600"}`}
      >
        {title}
      </h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing here.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => onSelect(t)}
                className="flex w-full items-center justify-between py-2 text-left text-sm hover:text-indigo-600"
              >
                <span className="truncate text-slate-700">{t.task}</span>
                <span className="ml-2 shrink-0 text-xs text-slate-400">{t.endDate}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
