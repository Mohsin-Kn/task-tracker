import { initials, ownerColor } from "../utils/style";

export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  if (!name) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 ${
          size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"
        }`}
        title="Unassigned"
      >
        —
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${ownerColor(
        name
      )} ${size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"}`}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
