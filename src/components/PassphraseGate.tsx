import { useState, type ReactNode } from "react";

const UNLOCK_KEY = "task-tracker:unlocked";

export function PassphraseGate({ children }: { children: ReactNode }) {
  const required = import.meta.env.VITE_APP_PASSPHRASE;
  const [unlocked, setUnlocked] = useState(
    () => !required || localStorage.getItem(UNLOCK_KEY) === "true"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function submit() {
    if (input === required) {
      localStorage.setItem(UNLOCK_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-xs rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-base font-semibold text-slate-800">Task Tracker</h1>
        <p className="mt-1 text-sm text-slate-400">Enter the team passphrase to continue.</p>
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className={`mt-4 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error
              ? "border-rose-300 focus:ring-rose-100"
              : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
          }`}
          placeholder="Passphrase"
        />
        {error && <p className="mt-1 text-xs text-rose-600">That's not it — try again.</p>}
        <button
          onClick={submit}
          className="mt-3 w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
