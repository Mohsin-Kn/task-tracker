# Migration notes

Mapping from `Mobility_Apps_Studio____TASK_TRACKER_.xlsx` (sheet: "Tasks Overview")
to this app's task fields.

| Sheet column      | App field       | Notes |
|--------------------|-----------------|-------|
| Task               | `task`          | Task title |
| Assignment Date     | `assignmentDate`| Kept as a separate date from Start date |
| Priority            | `priority`      | Sheet used `P0`, `P1`. Added `P2` as a third option for headroom. |
| Owner               | `owner`         | Sheet used `Danish`, `Yousuf`, `Mohsin` — set as default suggestions, but any name can be typed in. |
| Status              | `status`        | Sheet used `Not started`, `In progress`, `Completed` — used exactly as-is (this drives the board columns). |
| Task Type           | `taskType`      | Sheet used `Bug Fix`, `Feature Addition`, `Case Study`, `Validation` — used exactly as-is. |
| Start date          | `startDate`     | |
| End date            | `endDate`       | Used as the "due date" for overdue flagging, since the sheet had no separate due-date column. |
| Milestone           | `milestone`     | |
| Deliverable         | `deliverable`   | Empty in all 11 source rows, kept as a field for future use. |
| Notes               | `notes`         | Empty in all 11 source rows, kept as a field for future use. |

## Seed data

The 11 tasks in the uploaded sheet are preloaded in `src/data/seed.ts` so the app
opens with real data. A few obvious typos in the source sheet were corrected in the
seed data only (e.g. "mobilty" → "mobility", "Pipleine" → "Pipeline") — this doesn't
affect re-importing your live sheet later.

## Going forward

To bring in more rows later (or re-sync after editing the Google Sheet):

1. In Google Sheets: **File → Download → Comma Separated Values (.csv)**
2. In the app: **Import CSV** button in the toolbar.
3. Map each CSV column to the matching field using the table above.
4. Import — new tasks are added alongside existing ones (it does not overwrite).
