create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'manager', 'staff')),
  department text not null,
  phone text,
  avatar text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_login timestamptz
);

create table if not exists public.workflows (
  id text primary key,
  name text not null,
  description text,
  department text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_by text references public.app_users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workflow_departments (
  workflow_id text not null references public.workflows(id) on delete cascade,
  department text not null,
  sort_order integer not null default 1,
  primary key (workflow_id, department)
);

create table if not exists public.workflow_steps (
  id text primary key,
  workflow_id text not null references public.workflows(id) on delete cascade,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'rejected')),
  assigned_to text references public.app_users(id) on delete set null,
  step_order integer not null,
  portal_enabled boolean not null default false,
  direct_upload_enabled boolean not null default false,
  portal_deadline timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id text primary key,
  workflow_id text references public.workflows(id) on delete cascade,
  workflow_name text,
  step_id text references public.workflow_steps(id) on delete cascade,
  step_name text,
  name text not null,
  description text,
  category text not null default 'other',
  size_bytes bigint not null default 0,
  size text not null default '0 KB',
  type text not null default 'application/octet-stream',
  content text,
  original_file_name text,
  storage_path text,
  public_url text,
  uploaded_by text references public.app_users(id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text,
  status text not null default 'pending_approval' check (status in ('pending_approval', 'planning', 'active', 'on_hold', 'completed', 'cancelled')),
  manager text references public.app_users(id) on delete set null,
  manager_name text,
  start_date date,
  end_date date,
  progress integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_workflows (
  project_id text not null references public.projects(id) on delete cascade,
  workflow_id text not null references public.workflows(id) on delete cascade,
  primary key (project_id, workflow_id)
);

create table if not exists public.project_team_members (
  project_id text not null references public.projects(id) on delete cascade,
  user_id text not null references public.app_users(id) on delete cascade,
  user_name text,
  primary key (project_id, user_id)
);

create table if not exists public.approvals (
  id text primary key,
  request_type text not null default 'workflow' check (request_type in ('workflow', 'project')),
  project_id text references public.projects(id) on delete cascade,
  project_name text,
  workflow_id text,
  workflow_name text,
  step_id text,
  step_name text,
  requested_by text references public.app_users(id) on delete set null,
  requested_by_name text,
  assigned_to text references public.app_users(id) on delete set null,
  assigned_to_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  due_date timestamptz,
  requested_at timestamptz not null default timezone('utc', now()),
  decided_at timestamptz,
  signature text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.approval_comments (
  id text primary key,
  approval_id text not null references public.approvals(id) on delete cascade,
  user_id text references public.app_users(id) on delete set null,
  user_name text,
  text text not null,
  signature text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.approval_history (
  id text primary key,
  approval_id text not null references public.approvals(id) on delete cascade,
  action text not null,
  user_id text references public.app_users(id) on delete set null,
  user_name text,
  comment text,
  signature text,
  timestamp timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists app_users_set_updated_at on public.app_users;
create trigger app_users_set_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

drop trigger if exists workflows_set_updated_at on public.workflows;
create trigger workflows_set_updated_at
before update on public.workflows
for each row execute function public.set_updated_at();

drop trigger if exists workflow_steps_set_updated_at on public.workflow_steps;
create trigger workflow_steps_set_updated_at
before update on public.workflow_steps
for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists approvals_set_updated_at on public.approvals;
create trigger approvals_set_updated_at
before update on public.approvals
for each row execute function public.set_updated_at();

create or replace function public.sync_project_status_from_approvals()
returns trigger
language plpgsql
as $$
declare
  target_project_id text;
  approval_count integer;
  approved_count integer;
  rejected_count integer;
begin
  target_project_id := coalesce(new.project_id, old.project_id);

  if target_project_id is null then
    return coalesce(new, old);
  end if;

  select
    count(*),
    count(*) filter (where status = 'approved'),
    count(*) filter (where status = 'rejected')
  into approval_count, approved_count, rejected_count
  from public.approvals
  where project_id = target_project_id
    and request_type = 'project';

  update public.projects
  set status = case
    when rejected_count > 0 then 'cancelled'
    when approval_count > 0 and approved_count = approval_count then 'planning'
    else 'pending_approval'
  end
  where id = target_project_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists approvals_project_status_insert on public.approvals;
create trigger approvals_project_status_insert
after insert or update or delete on public.approvals
for each row execute function public.sync_project_status_from_approvals();

create or replace function public.app_login(p_username text, p_password text)
returns table (
  id text,
  username text,
  name text,
  email text,
  role text,
  department text,
  phone text,
  avatar text,
  is_active boolean,
  created_at timestamptz,
  last_login timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_user public.app_users%rowtype;
begin
  select *
  into matched_user
  from public.app_users
  where app_users.username = p_username
    and app_users.password_hash = crypt(p_password, app_users.password_hash)
  limit 1;

  if not found then
    return;
  end if;

  if not matched_user.is_active then
    return;
  end if;

  update public.app_users
  set last_login = timezone('utc', now())
  where app_users.id = matched_user.id;

  return query
  select
    app_users.id,
    app_users.username,
    app_users.name,
    app_users.email,
    app_users.role,
    app_users.department,
    app_users.phone,
    app_users.avatar,
    app_users.is_active,
    app_users.created_at,
    timezone('utc', now())
  from public.app_users
  where app_users.id = matched_user.id;
end;
$$;

create or replace function public.app_create_user(
  p_id text,
  p_username text,
  p_password text,
  p_name text,
  p_email text,
  p_role text,
  p_department text,
  p_phone text default null,
  p_avatar text default null
)
returns table (
  id text,
  username text,
  name text,
  email text,
  role text,
  department text,
  phone text,
  avatar text,
  is_active boolean,
  created_at timestamptz,
  last_login timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (
    id,
    username,
    password_hash,
    name,
    email,
    role,
    department,
    phone,
    avatar
  )
  values (
    p_id,
    p_username,
    crypt(p_password, gen_salt('bf')),
    p_name,
    p_email,
    p_role,
    p_department,
    p_phone,
    p_avatar
  );

  return query
  select
    app_users.id,
    app_users.username,
    app_users.name,
    app_users.email,
    app_users.role,
    app_users.department,
    app_users.phone,
    app_users.avatar,
    app_users.is_active,
    app_users.created_at,
    app_users.last_login
  from public.app_users
  where app_users.id = p_id;
end;
$$;

create or replace function public.app_change_password(
  p_user_id text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.app_users
  set password_hash = crypt(p_new_password, gen_salt('bf'))
  where id = p_user_id;

  return found;
end;
$$;

alter table public.app_users enable row level security;
alter table public.workflows enable row level security;
alter table public.workflow_departments enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.documents enable row level security;
alter table public.projects enable row level security;
alter table public.project_workflows enable row level security;
alter table public.project_team_members enable row level security;
alter table public.approvals enable row level security;
alter table public.approval_comments enable row level security;
alter table public.approval_history enable row level security;
alter table public.notifications enable row level security;

drop policy if exists app_users_public_rw on public.app_users;
create policy app_users_public_rw on public.app_users for all using (true) with check (true);

drop policy if exists workflows_public_rw on public.workflows;
create policy workflows_public_rw on public.workflows for all using (true) with check (true);

drop policy if exists workflow_departments_public_rw on public.workflow_departments;
create policy workflow_departments_public_rw on public.workflow_departments for all using (true) with check (true);

drop policy if exists workflow_steps_public_rw on public.workflow_steps;
create policy workflow_steps_public_rw on public.workflow_steps for all using (true) with check (true);

drop policy if exists documents_public_rw on public.documents;
create policy documents_public_rw on public.documents for all using (true) with check (true);

drop policy if exists projects_public_rw on public.projects;
create policy projects_public_rw on public.projects for all using (true) with check (true);

drop policy if exists project_workflows_public_rw on public.project_workflows;
create policy project_workflows_public_rw on public.project_workflows for all using (true) with check (true);

drop policy if exists project_team_members_public_rw on public.project_team_members;
create policy project_team_members_public_rw on public.project_team_members for all using (true) with check (true);

drop policy if exists approvals_public_rw on public.approvals;
create policy approvals_public_rw on public.approvals for all using (true) with check (true);

drop policy if exists approval_comments_public_rw on public.approval_comments;
create policy approval_comments_public_rw on public.approval_comments for all using (true) with check (true);

drop policy if exists approval_history_public_rw on public.approval_history;
create policy approval_history_public_rw on public.approval_history for all using (true) with check (true);

drop policy if exists notifications_public_rw on public.notifications;
create policy notifications_public_rw on public.notifications for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists documents_bucket_public_read on storage.objects;
create policy documents_bucket_public_read
on storage.objects for select
using (bucket_id = 'documents');

drop policy if exists documents_bucket_public_write on storage.objects;
create policy documents_bucket_public_write
on storage.objects for insert
with check (bucket_id = 'documents');

drop policy if exists documents_bucket_public_update on storage.objects;
create policy documents_bucket_public_update
on storage.objects for update
using (bucket_id = 'documents')
with check (bucket_id = 'documents');

drop policy if exists documents_bucket_public_delete on storage.objects;
create policy documents_bucket_public_delete
on storage.objects for delete
using (bucket_id = 'documents');
