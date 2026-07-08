import type { Priority, Status } from "../types/task";

export const PRIORITY_STYLES: Record<Priority, string> = {
  P0: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  P1: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  P2: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export const STATUS_STYLES: Record<Status, string> = {
  "Not started": "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  "In progress": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export const STATUS_DOT: Record<Status, string> = {
  "Not started": "bg-slate-400",
  "In progress": "bg-sky-500",
  Completed: "bg-emerald-500",
};

const OWNER_PALETTE = [
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-lime-100 text-lime-700",
];

export function ownerColor(name: string): string {
  if (!name) return "bg-slate-100 text-slate-500";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return OWNER_PALETTE[hash % OWNER_PALETTE.length];
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
