import type { Task, TaskDraft } from "../types/task";

export interface TaskRow {
  id: string;
  task: string;
  assignment_date: string | null;
  priority: string;
  owner: string;
  status: string;
  task_type: string;
  start_date: string | null;
  end_date: string | null;
  milestone: string;
  deliverable: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    task: row.task,
    assignmentDate: row.assignment_date,
    priority: row.priority as Task["priority"],
    owner: row.owner ?? "",
    status: row.status as Task["status"],
    taskType: row.task_type as Task["taskType"],
    startDate: row.start_date,
    endDate: row.end_date,
    milestone: row.milestone ?? "",
    deliverable: row.deliverable ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function draftToRow(draft: TaskDraft): Omit<TaskRow, "id" | "created_at" | "updated_at"> {
  return {
    task: draft.task,
    assignment_date: draft.assignmentDate,
    priority: draft.priority,
    owner: draft.owner,
    status: draft.status,
    task_type: draft.taskType,
    start_date: draft.startDate,
    end_date: draft.endDate,
    milestone: draft.milestone,
    deliverable: draft.deliverable,
    notes: draft.notes,
  };
}

export function patchToRow(patch: Partial<TaskDraft>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {};
  if (patch.task !== undefined) row.task = patch.task;
  if (patch.assignmentDate !== undefined) row.assignment_date = patch.assignmentDate;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.owner !== undefined) row.owner = patch.owner;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.taskType !== undefined) row.task_type = patch.taskType;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.endDate !== undefined) row.end_date = patch.endDate;
  if (patch.milestone !== undefined) row.milestone = patch.milestone;
  if (patch.deliverable !== undefined) row.deliverable = patch.deliverable;
  if (patch.notes !== undefined) row.notes = patch.notes;
  return row;
}
