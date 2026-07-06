insert into public.app_users (
  id, username, password_hash, name, email, role, department, phone, is_active, created_at
)
values
  ('1', 'admin', extensions.crypt('admin', extensions.gen_salt('bf')), 'Admin', 'admin@company.com', 'admin', 'IT', '+1-555-0101', true, '2024-01-01T08:00:00Z'),
  ('2', 'panchali', extensions.crypt('panchali123', extensions.gen_salt('bf')), 'Panchali', 'panchali@company.com', 'manager', 'Operations', '+1-555-0102', true, '2024-01-05T10:00:00Z'),
  ('3', 'nirmal', extensions.crypt('nirmal123', extensions.gen_salt('bf')), 'Nirmal', 'nirmal@company.com', 'staff', 'Finance', '+1-555-0103', true, '2024-01-10T11:00:00Z'),
  ('4', 'sewmi.hiruni', extensions.crypt('sewmi123', extensions.gen_salt('bf')), 'Sewmi.Hiruni', 'sewmi.hiruni@company.com', 'staff', 'HR', '+1-555-0104', true, '2024-01-12T09:00:00Z'),
  ('5', 'isma', extensions.crypt('isma123', extensions.gen_salt('bf')), 'Isma', 'isma@company.com', 'staff', 'Procurement', '+1-555-0105', true, '2024-01-14T09:00:00Z')
on conflict (id) do update
set
  username = excluded.username,
  password_hash = excluded.password_hash,
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  department = excluded.department,
  phone = excluded.phone,
  is_active = excluded.is_active;
