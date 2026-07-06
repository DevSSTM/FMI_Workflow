# Workflow ERP

Enterprise workflow and document management application built with React, Zustand, and Tailwind. The frontend now targets a normalized Supabase backend instead of the old in-memory mocks.

## Stack

- React 18 + Vite
- Tailwind CSS
- Zustand
- React Router
- React Hook Form
- Supabase Postgres + Storage

## Setup

```bash
cd workflow-erp
npm install
```

Create `workflow-erp/.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only key>
```

Apply the backend SQL in your Supabase project:

1. Run `supabase/schema.sql` in the SQL Editor.
2. Run `supabase/seed.sql` in the SQL Editor.

Then start the app:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Backend Model

The backend uses separate tables so the system can scale without collapsing unrelated data into one structure:

- `app_users`
- `workflows`
- `workflow_departments`
- `workflow_steps`
- `documents`
- `projects`
- `project_workflows`
- `project_team_members`
- `approvals`
- `approval_comments`
- `approval_history`
- `notifications`

Document files are stored in the Supabase Storage bucket `documents`.

## Login

The current app keeps its existing localStorage-based session behavior, but the credential check is now backed by a Supabase RPC with hashed passwords.

Seeded users:

- `admin` / `admin`
- `panchali` / `panchali123`
- `nirmal` / `nirmal123`
- `sewmi.hiruni` / `sewmi123`
- `isma` / `isma123`

## Notes

- Browser code only uses the anon key.
- The service role key should stay server-side only.
- For production, replace the lightweight custom login/session flow with Supabase Auth or a dedicated backend session layer.
