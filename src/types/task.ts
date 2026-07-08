export const STATUSES = ["Not started", "In progress", "Completed"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["P0", "P1", "P2"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_TYPES = [
  "Bug Fix",
  "Feature Addition",
  "Case Study",
  "Validation",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const OWNERS = ["Danish", "Yousuf", "Mohsin"] as const;

export interface Task {
  id: string;
  task: string;
  assignmentDate: string | null; // ISO date
  priority: Priority;
  owner: string;
  status: Status;
  taskType: TaskType;
  startDate: string | null; // ISO date
  endDate: string | null; // ISO date
  milestone: string;
  deliverable: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskDraft = Omit<Task, "id" | "createdAt" | "updatedAt">;
