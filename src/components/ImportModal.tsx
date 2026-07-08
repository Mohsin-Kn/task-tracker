import { useRef, useState } from "react";
import type { TaskDraft } from "../types/task";
import { parseCsv, rowsToDrafts } from "../utils/csv";

const FIELD_OPTIONS: { key: keyof TaskDraft; label: string }[] = [
  { key: "task", label: "Task title" },
  { key: "assignmentDate", label: "Assignment date" },
  { key: "priority", label: "Priority" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "taskType", label: "Task type" },
  { key: "startDate", label: "Start date" },
  { key: "endDate", label: "End date" },
  { key: "milestone", label: "Milestone" },
  { key: "deliverable", label: "Deliverable" },
  { key: "notes", label: "Notes" },
];

function guessField(header: string): keyof TaskDraft | "" {
  const h = header.toLowerCase().replace(/\s+/g, "");
  const match = FIELD_OPTIONS.find((f) => f.key.toLowerCase() === h || f.label.toLowerCase().replace(/\s+/g, "") === h);
  if (match) return match.key;
  if (h.includes("task") || h.includes("title")) return "task";
  if (h.includes("owner") || h.includes("assignee")) return "owner";
  if (h.includes("priority")) return "priority";
  if (h.includes("status")) return "status";
  if (h.includes("type")) return "taskType";
  if (h.includes("start")) return "startDate";
  if (h.includes("end") || h.includes("due")) return "endDate";
  if (h.includes("milestone")) return "milestone";
  if (h.includes("deliverable")) return "deliverable";
  if (h.includes("note")) return "notes";
  if (h.includes("assignmentdate")) return "assignmentDate";
  return "";
}

export function ImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (drafts: TaskDraft[]) => void;
}) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, keyof TaskDraft | "">>({});
  const fileInput = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const { headers: h, rows: r } = parseCsv(String(reader.result));
      setHeaders(h);
      setRows(r);
      const guessed: Record<string, keyof TaskDraft | ""> = {};
      h.forEach((header) => {
        guessed[header] = guessField(header);
      });
      setMapping(guessed);
    };
    reader.readAsText(file);
  }

  function reset() {
    setHeaders([]);
    setRows([]);
    setMapping({});
    if (fileInput.current) fileInput.current.value = "";
  }

  function handleImport() {
    const finalMapping: Record<string, keyof TaskDraft> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (field) finalMapping[header] = field;
    }
    const drafts = rowsToDrafts(headers, rows, finalMapping);
    onImport(drafts);
    reset();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8 backdrop-blur-sm"
      onClick={() => {
        reset();
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Import tasks from CSV</h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {headers.length === 0 ? (
            <div>
              <p className="text-sm text-slate-500">
                Export your Google Sheet as CSV (File → Download → Comma-separated values), then
                upload it here. You'll be able to map each column to a task field before
                importing.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="mt-3 block w-full text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {rows.length} row{rows.length === 1 ? "" : "s"} found. Map each column below, then
                import. Unmapped columns are ignored.
              </p>
              <div className="space-y-2">
                {headers.map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <span className="w-40 truncate text-sm font-medium text-slate-600" title={h}>
                      {h}
                    </span>
                    <span className="text-slate-300">→</span>
                    <select
                      value={mapping[h] ?? ""}
                      onChange={(e) =>
                        setMapping((prev) => ({
                          ...prev,
                          [h]: e.target.value as keyof TaskDraft | "",
                        }))
                      }
                      className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      <option value="">Ignore this column</option>
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="rounded-md bg-slate-50 p-3">
                <p className="mb-1 text-xs font-medium text-slate-500">Preview (first 3 rows)</p>
                <div className="space-y-1 text-xs text-slate-600">
                  {rows.slice(0, 3).map((r, i) => (
                    <div key={i} className="truncate">
                      {r.join(" · ")}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {headers.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <button
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Choose a different file
            </button>
            <button
              onClick={handleImport}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Import {rows.length} task{rows.length === 1 ? "" : "s"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
