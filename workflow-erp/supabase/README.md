# Supabase Backend Setup

This app now expects a normalized Supabase backend instead of the in-memory mock services.

## 1. Environment

Create `workflow-erp/.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only key>
```

`SUPABASE_SERVICE_ROLE_KEY` is for server/admin scripts only. Do not expose it in browser code.

## 2. Apply Schema

Open the Supabase SQL Editor for your project and run:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

The schema creates separate tables for:

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

It also creates a public `documents` storage bucket and simple RLS policies.

## 3. Notes

- The current app keeps its existing localStorage-based session model.
- Login is backed by a secure-definer RPC `app_login` against hashed passwords.
- For production, replace the lightweight custom login flow with Supabase Auth or a dedicated backend session layer.
