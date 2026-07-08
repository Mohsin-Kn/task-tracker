import { useCallback, useEffect, useState } from "react";
import type { Task, TaskDraft } from "../types/task";
import { seedTasks } from "../data/seed";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { rowToTask, draftToRow, patchToRow, type TaskRow } from "../lib/taskRows";

const STORAGE_KEY = "task-tracker:tasks";

function loadLocal(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTasks;
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedTasks;
  } catch {
    return seedTasks;
  }
}

function saveLocal(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => (isSupabaseConfigured ? [] : loadLocal()));
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  // Local persistence (no-op when Supabase is configured)
  useEffect(() => {
    if (!isSupabaseConfigured) saveLocal(tasks);
  }, [tasks]);

  // Initial fetch + realtime subscription when Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;

    async function init() {
      const { data, error: fetchError } = await supabase!
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (fetchError) setError(fetchError.message);
      else if (data) setTasks((data as TaskRow[]).map(rowToTask));
      setLoading(false);
    }
    init();

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          setTasks((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as TaskRow;
              if (prev.some((t) => t.id === row.id)) return prev;
              return [rowToTask(row), ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as TaskRow;
              return prev.map((t) => (t.id === row.id ? rowToTask(row) : t));
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as Partial<TaskRow>;
              return prev.filter((t) => t.id !== oldRow.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase!.removeChannel(channel);
    };
  }, []);

  const addTask = useCallback((draft: TaskDraft) => {
    const now = new Date().toISOString();
    const optimistic: Task = { ...draft, id: makeId(), createdAt: now, updatedAt: now };
    setTasks((prev) => [optimistic, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .insert(draftToRow(draft))
        .select()
        .single()
        .then(({ data, error: insertError }) => {
          if (insertError) {
            setError(insertError.message);
            setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
            return;
          }
          if (data) {
            const real = rowToTask(data as TaskRow);
            setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? real : t)));
          }
        });
    }
    return optimistic;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<TaskDraft>) => {
    const now = new Date().toISOString();
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t)));
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .update({ ...patchToRow(patch), updated_at: now })
        .eq("id", id)
        .then(({ error: updateError }) => {
          if (updateError) setError(updateError.message);
        });
    }
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .then(({ error: deleteError }) => {
          if (deleteError) setError(deleteError.message);
        });
    }
  }, []);

  const deleteTasks = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setTasks((prev) => prev.filter((t) => !idSet.has(t.id)));
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .delete()
        .in("id", ids)
        .then(({ error: deleteError }) => {
          if (deleteError) setError(deleteError.message);
        });
    }
  }, []);

  const restoreTasks = useCallback((restored: Task[]) => {
    setTasks((prev) => [...restored, ...prev]);
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .insert(restored.map((t) => ({ ...draftToRow(t), id: t.id })))
        .then(({ error: insertError }) => {
          if (insertError) setError(insertError.message);
        });
    }
  }, []);

  const bulkUpdate = useCallback((ids: string[], patch: Partial<TaskDraft>) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    setTasks((prev) => prev.map((t) => (idSet.has(t.id) ? { ...t, ...patch, updatedAt: now } : t)));
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .update({ ...patchToRow(patch), updated_at: now })
        .in("id", ids)
        .then(({ error: updateError }) => {
          if (updateError) setError(updateError.message);
        });
    }
  }, []);

  const importTasks = useCallback((drafts: TaskDraft[]) => {
    const now = new Date().toISOString();
    const newTasks: Task[] = drafts.map((d) => ({
      ...d,
      id: makeId(),
      createdAt: now,
      updatedAt: now,
    }));
    setTasks((prev) => [...newTasks, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("tasks")
        .insert(drafts.map(draftToRow))
        .select()
        .then(({ data, error: insertError }) => {
          if (insertError) {
            setError(insertError.message);
            return;
          }
          if (data) {
            const real = (data as TaskRow[]).map(rowToTask);
            setTasks((prev) => {
              const withoutTemp = prev.filter((t) => !newTasks.some((n) => n.id === t.id));
              return [...real, ...withoutTemp];
            });
          }
        });
    }
    return newTasks;
  }, []);

  const resetToSeed = useCallback(() => {
    if (isSupabaseConfigured) return; // shared DB is (re)seeded via supabase/seed.sql instead
    setTasks(seedTasks);
  }, []);

  return {
    tasks,
    loading,
    error,
    mode: isSupabaseConfigured ? ("shared" as const) : ("local" as const),
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    restoreTasks,
    bulkUpdate,
    importTasks,
    resetToSeed,
  };
}
