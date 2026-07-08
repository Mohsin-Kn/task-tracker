-- Optional: seeds the same 11 tasks from the original sheet.
-- Run after schema.sql. Safe to skip if you'd rather start empty or import your own CSV.

insert into tasks (task, priority, owner, status, task_type, start_date, milestone) values
('Mobility Accounts Access Transfer', 'P0', 'Danish', 'Completed', 'Bug Fix', '2026-07-02', 'Data is only accessible on mobility dashboard'),
('Imagination Access Revocation', 'P0', 'Danish', 'Not started', 'Bug Fix', '2026-07-02', 'Data is only accessible on mobility dashboard'),
('Play Reviews Data Pipeline', 'P1', 'Danish', 'Not started', 'Feature Addition', null, 'Reviews analysis'),
('Pipeline Restructuring (Silver & Gold layers)', 'P1', 'Danish', 'In progress', 'Case Study', null, 'Data accuracy attainment for country and overview numbers'),
('User Acquisition (Marketing Dashboard)', 'P0', 'Yousuf', 'In progress', 'Case Study', '2026-07-03', 'UA overview & insights'),
('Marketing Playbook', 'P1', 'Yousuf', 'Not started', 'Case Study', null, 'Marketing cost spend management'),
('Data Back-fill (Jan''26 - Mar''26)', 'P1', 'Mohsin', 'Completed', 'Bug Fix', null, 'Accurate data visibility for historic data'),
('Product Dashboard Validation', 'P0', 'Mohsin', 'Not started', 'Validation', null, 'Dashboard ready for utilization'),
('Automated Pipeline Re-run', 'P1', 'Mohsin', 'Not started', 'Feature Addition', null, 'Fail-safe data pipelines'),
('Skills.md file for pipeline re-run & reinforcement learning', 'P1', 'Mohsin', 'Not started', 'Case Study', null, 'Optimization of pipelines'),
('Dashboards Replication On React', 'P1', 'Mohsin', 'In progress', 'Feature Addition', '2026-06-30', 'Dependency removal from Looker dashboard');
