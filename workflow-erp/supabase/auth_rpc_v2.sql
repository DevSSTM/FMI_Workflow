create extension if not exists pgcrypto with schema extensions;

create or replace function public.app_login_v2(p_username text, p_password text)
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
set search_path = public, extensions
as $$
declare
  matched_user public.app_users%rowtype;
begin
  select *
  into matched_user
  from public.app_users
  where app_users.username = p_username
    and app_users.password_hash = extensions.crypt(p_password, app_users.password_hash)
  limit 1;

  if not found or not matched_user.is_active then
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
    app_users.last_login
  from public.app_users
  where app_users.id = matched_user.id;
end;
$$;

create or replace function public.app_create_user_v2(
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
set search_path = public, extensions
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
    extensions.crypt(p_password, extensions.gen_salt('bf')),
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

create or replace function public.app_change_password_v2(
  p_user_id text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.app_users
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  where id = p_user_id;

  return found;
end;
$$;
