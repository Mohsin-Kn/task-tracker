# Task Tracker — Mobility Apps Studio

An internal task tracker, built to replace the "Tasks Overview" Google Sheet.
Table view, Kanban board, calendar, and a small dashboard — no login, and it can
run entirely for free.

## What's inside

- **Table view** — sortable columns, inline edit of owner/priority/status, search,
  filters, multi-select + bulk delete, CSV export, overdue tasks flagged in red.
- **Board view** — drag cards between columns (Not started / In progress / Completed),
  quick-add per column.
- **Calendar view** — month grid, tasks placed on their due date; tasks without a
  due date are listed in a side panel.
- **Dashboard** — status breakdown, tasks per owner, a 14-day created-vs-completed
  trend, plus overdue and due-this-week lists.
- **Add / edit tasks** — full form with all fields from the original sheet.
- **CSV import** — upload a CSV export of your sheet, map columns, import.
- **Undo** on delete.
- **Optional passphrase gate** — a lightweight shared lock screen (see below).
- Seeded with the 11 tasks from your uploaded sheet so it's ready to use immediately.

## How data is stored: local vs. shared

By default this app has **no backend** — tasks are saved in your browser's
`localStorage`. That's zero setup, but data lives on one device only.

To **share live data with your team**, connect a free Supabase project (see below).
Once connected, a green "Shared with team" badge appears in the header, everyone
who opens the link sees the same tasks, and changes sync live via Supabase
Realtime. Without it, you'll see a grey "Local only" badge.

The app decides which mode to use automatically based on whether Supabase
environment variables are set — nothing else about the app changes between modes.

### Setting up shared mode (Supabase — free tier)

1. Create a free project at [supabase.com](https://supabase.com).
2. In your new project, go to **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it.
3. Optional: also run `supabase/seed.sql` to preload the same 11 tasks from the
   original sheet (skip this if you'd rather start empty or import your own CSV).
4. Go to **Project Settings → API** and copy the **Project URL** and **anon public**
   key.
5. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Restart `yarn dev` (or rebuild). The header badge should now say "Shared with team".
7. **Free-tier note:** Supabase pauses projects after 7 days of no requests. For an
   internal tool used most weeks this is rarely an issue, but if the team goes quiet
   for a week, the first person to open the app afterward may need to wait ~30
   seconds for it to wake up, or you can add a free scheduled GitHub Action that
   pings the project every few days to keep it warm.

### Optional: passphrase gate

Since there's no login, the deployed URL is the access control. If you want a
lightweight extra layer, set `VITE_APP_PASSPHRASE` in `.env` to any phrase — visitors
will need to enter it once per browser before the app loads. This is a convenience
layer, not real security (it's checked client-side).

## Requirements

- [Node.js](https://nodejs.org) 18 or newer
- [Yarn](https://yarnpkg.com) (`npm install -g yarn` if you don't have it)

## Run it locally

```bash
cd task-tracker
yarn
yarn dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Build for production

```bash
yarn build
```

This produces a static site in `dist/`. Preview it locally with:

```bash
yarn preview
```

## Deploy for free

`dist/` is a plain static site, so any static host works. Two easy free options:

### Cloudflare Pages
1. Push this folder to a GitHub repo.
2. In Cloudflare Pages, "Create a project" → connect the repo.
3. Build command: `yarn build`, output directory: `dist`.
4. Deploy — you'll get a free `*.pages.dev` URL.

### Netlify
1. Push this folder to a GitHub repo.
2. In Netlify, "Add new site" → import the repo.
3. Build command: `yarn build`, publish directory: `dist`.
4. Deploy — you'll get a free `*.netlify.app` URL.

You can also drag-and-drop the `dist/` folder directly onto either dashboard for a
one-off deploy without connecting a repo.

If you're using shared mode or the passphrase gate, add the same variables from
your `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_PASSPHRASE`)
to your host's environment variable settings before building — Cloudflare Pages
and Netlify both have a place for this under the project's build settings.

> Note: since there's no login, treat the deployed URL as the access control —
> don't post it publicly (use the passphrase gate for a bit of extra friction if
> you'd like). If you've set the `VITE_SUPABASE_*` env vars on your host, everyone
> on the deployed URL shares live data. If not, each visitor gets their own local
> copy that won't sync with anyone else's.

## Project structure

```
src/
  types/task.ts             task shape + status/priority/type enums
  data/seed.ts               the 11 tasks from your original sheet (local mode only)
  lib/supabase.ts             Supabase client (null when not configured)
  lib/taskRows.ts              maps app fields <-> Supabase columns
  hooks/useTasks.ts            all data access — local storage or Supabase, same API either way
  hooks/useToasts.ts           toast notifications
  utils/csv.ts                 CSV export/import helpers
  utils/style.ts               badge colors, avatar initials
  components/
    TableView.tsx               table with inline edit, filters, bulk actions
    BoardView.tsx                Kanban board with drag-and-drop
    CalendarView.tsx             month calendar
    DashboardView.tsx            charts (recharts) + overdue/due-this-week lists
    TaskModal.tsx                add/edit form
    ImportModal.tsx              CSV import with column mapping
    PassphraseGate.tsx           optional lock screen
    Toolbar.tsx, Avatar.tsx, ConfirmDialog.tsx, ToastStack.tsx
  App.tsx                     wires it all together
supabase/
  schema.sql                  run once in Supabase SQL editor to enable shared mode
  seed.sql                    optional — preloads the original 11 tasks
```

## Customizing

Statuses, priorities, task types, and owners are the same ones used in the original
sheet. To change them, edit `src/types/task.ts`:

```ts
export const STATUSES = ["Not started", "In progress", "Completed"] as const;
export const PRIORITIES = ["P0", "P1", "P2"] as const;
export const TASK_TYPES = ["Bug Fix", "Feature Addition", "Case Study", "Validation"] as const;
export const OWNERS = ["Danish", "Yousuf", "Mohsin"] as const;
```

New owners typed into the task form are picked up automatically too — the `OWNERS`
list is just the default suggestions.

See `MIGRATION.md` for how the original sheet's columns map to this app's fields.
