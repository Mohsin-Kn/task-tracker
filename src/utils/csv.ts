import type { Task, TaskDraft } from "../types/task";

const COLUMNS: { key: keyof Task; label: string }[] = [
  { key: "task", label: "Task" },
  { key: "assignmentDate", label: "Assignment Date" },
  { key: "priority", label: "Priority" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "taskType", label: "Task Type" },
  { key: "startDate", label: "Start date" },
  { key: "endDate", label: "End date" },
  { key: "milestone", label: "Milestone" },
  { key: "deliverable", label: "Deliverable" },
  { key: "notes", label: "Notes" },
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function tasksToCsv(tasks: Task[]): string {
  const header = COLUMNS.map((c) => escapeCsv(c.label)).join(",");
  const rows = tasks.map((t) =>
    COLUMNS.map((c) => escapeCsv(String(t[c.key] ?? ""))).join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Basic CSV line parser that respects quoted fields.
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

const DEFAULT_DRAFT: TaskDraft = {
  task: "",
  assignmentDate: null,
  priority: "P1",
  owner: "",
  status: "Not started",
  taskType: "Feature Addition",
  startDate: null,
  endDate: null,
  milestone: "",
  deliverable: "",
  notes: "",
};

/** Builds task drafts from parsed CSV rows given a column-header -> field mapping. */
export function rowsToDrafts(
  headers: string[],
  rows: string[][],
  mapping: Record<string, keyof TaskDraft>
): TaskDraft[] {
  const headerIndex = new Map(headers.map((h, i) => [h, i]));
  return rows.map((row) => {
    const draft: TaskDraft = { ...DEFAULT_DRAFT };
    for (const [header, field] of Object.entries(mapping)) {
      const idx = headerIndex.get(header);
      if (idx === undefined) continue;
      const raw = (row[idx] ?? "").trim();
      if (field === "priority" || field === "status" || field === "taskType") {
        if (raw) (draft as unknown as Record<string, string>)[field] = raw;
      } else if (field === "assignmentDate" || field === "startDate" || field === "endDate") {
        (draft as unknown as Record<string, string | null>)[field] = raw || null;
      } else {
        (draft as unknown as Record<string, string>)[field] = raw;
      }
    }
    return draft;
  });
}

export { COLUMNS as CSV_COLUMNS };
