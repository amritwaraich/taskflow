# TaskFlow — Project Design Document

> Any agent that reads this file has everything needed to work on TaskFlow.

---

## What Is TaskFlow?

TaskFlow is a Todoist clone — a productivity app for managing tasks and projects. It has one key differentiator: **3-layer subtask hierarchy** (tasks can have sub-tasks, which can have sub-sub-tasks, max depth of 3).

**Live:** https://taskflow-nine-woad.vercel.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe (subscriptions) |
| State | Zustand + React Query |
| Date Parsing | chrono-node |
| Icons | lucide-react |
| Deployment | Vercel |

**Brand color:** Violet — `#8B5CF6` (use `bg-violet-600`, `text-violet-600`, etc.)

---

## Project Structure

```
C:\Users\Waraich\projects\taskflow\
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/              # App shell routes (inbox, today, upcoming, projects, etc.)
│   │   ├── auth/               # Auth pages (login, signup, forgot-password, etc.)
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── tasks/              # TaskItem, TaskDetailModal, QuickAddModal
│   │   ├── projects/           # ProjectList, ProjectItem
│   │   ├── sections/           # SectionList, SectionItem
│   │   ├── labels/             # LabelBadge
│   │   ├── layout/             # AppSidebar
│   │   └── ui/                 # PriorityPicker, DatePicker, ColorPicker, IconPicker
│   ├── lib/
│   │   ├── supabase/           # client.ts, server.ts, middleware.ts
│   │   └── api/                # tasks.ts, projects.ts, labels.ts, sections.ts
│   ├── store/
│   │   └── tasks.ts            # Zustand store
│   └── types/
│       └── index.ts           # TypeScript types
├── supabase/
│   └── config.toml             # Supabase CLI config
├── schema.sql                   # Full database schema (run in Supabase SQL Editor)
├── .env                         # Local env vars (NEVER commit this)
├── .env.example                  # Template for .env
└── .gitignore
```

---

## Database Schema (Applied in Supabase)

All tables are created in Supabase. Run `schema.sql` in the Supabase SQL Editor if recreating.

**Tables:**
- `profiles` — extends auth.users (subscription_tier, theme, karma, etc.)
- `projects` — user projects with color, icon, view_style, is_shared
- `sections` — groupings within projects
- `tasks` — the core table with 3-layer hierarchy support
  - `parent_id` — references tasks.id (for subtasks)
  - `grandparent_id` — cached ref for layer 3 tasks
  - `layer` — 1 (master), 2 (sub), 3 (sub-sub)
- `labels` — user-created labels with color
- `task_labels` — junction table
- `reminders` — task reminders
- `comments` — task comments
- `filters` — saved custom filters
- `recurring_templates` — recurring task rules

**RLS is enabled** — all tables have row-level security policies scoped to `auth.uid()`.

**Auto-profile trigger:** When a user signs up via auth.users, a profile row is auto-created.

---

## Key Features

### 3-Layer Subtask Hierarchy
- Layer 1: Master task (top-level, no parent)
- Layer 2: Sub-task (child of a layer 1 task)
- Layer 3: Sub-sub-task (child of a layer 2 task)
- Layer 3 tasks cannot have children (max depth = 3)
- UI shows indentation: Layer 1 → normal, Layer 2 → indented 1 level, Layer 3 → indented 2 levels
- Tasks can be collapsed/expanded
- Moving a subtask out to top-level resets it to layer 1

### Quick Add (Cmd/Ctrl+K)
- Global shortcut opens modal
- Natural language parsing: `Buy groceries tomorrow at 5pm #shopping p1`
- Parses: content, due_date (chrono-node), priority (p1-p4), labels (#labelname)
- Tab through fields, Enter to submit, Escape to close

### Task Properties
- Content (title, required)
- Description (markdown)
- Due date + due string (natural language)
- Priority (p1=red, p2=orange, p3=blue, p4=gray)
- Labels (multi-select)
- Section assignment
- Project assignment
- Recurring (rule-based)

### Views
- **Inbox** — tasks with no project
- **Today** — tasks due today + overdue at top
- **Upcoming** — 7-day rolling, grouped by day
- **Projects** — all user projects, list/board toggle
- **Project Detail** — tasks within a project, grouped by section
- **Labels** — all labels with filter
- **Filters** — custom query filters

---

## Subscription Plans

### Free
- 5 projects max
- 3 custom filters
- Basic views (list, board)
- 2 themes

### Pro — $1/month
- Unlimited projects
- Unlimited filters
- Calendar view
- All themes
- Task duration
- Custom reminders
- Productivity visualizations

Feature gating is done via `subscription_tier` column in `profiles` table.

---

## GitHub

**Repo:** https://github.com/amritwaraich/taskflow

**Branches:** `main` is the production branch.

**Workflow:**
```bash
git checkout -b feature/feature-name   # work on a feature
git commit -m "description"
git push origin feature/feature-name   # push to share
git checkout main && git pull          # on other machines
```

---

## Deployment

Deployed on Vercel. GitHub is connected — every push to `main` auto-deploys.

**Production URL:** https://taskflow-nine-woad.vercel.app

**Environment variables set in Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

---

## Phases

- **Phase 1** ✅ — Foundation: Next.js, Supabase schema, auth, landing page
- **Phase 2** ✅ — Core features: projects, tasks, 3-layer hierarchy, Quick Add, views
- **Phase 3** — Stripe billing (checkout + webhooks + portal)
- **Phase 4** — Calendar view, recurring tasks, reminders, productivity karma
- **Phase 5** — Polish, mobile responsive, activity history

---

## Notes for Agents

- Never commit `.env` or any file containing real API keys
- Use `violet-600` (#8B5CF6) as the primary brand color throughout
- All components should have proper focus states, hover states, and transitions
- The 3-layer hierarchy is the key differentiator — make indent levels visually clear
- Before building significant features, read the full plan at `C:\Users\Waraich\.openclaw\workspace\plans\taskflow-plan.md`
- Supabase is already linked and the schema is applied — no need to recreate tables
