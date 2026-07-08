-- Task Tracker — Supabase schema
-- Run this once in your Supabase project's SQL editor (Database → SQL Editor → New query).

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  assignment_date date,
  priority text not null default 'P1',
  owner text not null default '',
  status text not null default 'Not started',
  task_type text not null default 'Feature Addition',
  start_date date,
  end_date date,
  milestone text not null default '',
  deliverable text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_updated on tasks;
create trigger tasks_updated
  before update on tasks
  for each row execute function set_updated_at();

-- No login in this app — access is via the anon key, scoped wide open on purpose.
-- Keep the deployed URL private; this is not a substitute for real auth.
alter table tasks enable row level security;

drop policy if exists anon_all_tasks on tasks;
create policy anon_all_tasks on tasks for all to anon using (true) with check (true);

-- Required for Supabase projects created after 2026-05-30 (explicit PostgREST grants).
grant usage on schema public to anon;
grant select, insert, update, delete on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon;

-- Enable Realtime so the whole team sees live updates:
-- Database → Replication → toggle "tasks" on (or run the line below).
alter publication supabase_realtime add table tasks;
