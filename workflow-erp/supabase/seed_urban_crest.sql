insert into public.projects (
  id,
  name,
  description,
  status,
  manager,
  manager_name,
  start_date,
  progress
)
values (
  'PRJ-URBAN-CREST-001',
  'URBAN CREST APARTMENTS',
  'Operational management project for Urban Crest Apartments based on the resident handbook, janitor standing orders, and utility disconnection procedure.',
  'active',
  '2',
  'Project Manager',
  current_date,
  12
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  manager = excluded.manager,
  manager_name = excluded.manager_name,
  start_date = excluded.start_date,
  progress = excluded.progress;

insert into public.project_team_members (project_id, user_id, user_name)
values
  ('PRJ-URBAN-CREST-001', '1', 'Admin'),
  ('PRJ-URBAN-CREST-001', '2', 'Panchali'),
  ('PRJ-URBAN-CREST-001', '3', 'Nirmal'),
  ('PRJ-URBAN-CREST-001', '4', 'Sewmi.Hiruni'),
  ('PRJ-URBAN-CREST-001', '5', 'Isma')
on conflict (project_id, user_id) do update
set user_name = excluded.user_name;

insert into public.workflows (
  id,
  name,
  description,
  department,
  status,
  created_by
)
values
  (
    'WF-URBAN-CREST-001',
    'Resident Access and Occupancy Administration',
    'Workflow for owner, tenant, staff, visitor, and access-card administration based on the Urban Crest resident handbook.',
    'Operations',
    'in_progress',
    '1'
  ),
  (
    'WF-URBAN-CREST-002',
    'Emergency and Essential Service Response',
    'Workflow for fire, lift, power, and other essential service incidents based on the Urban Crest resident handbook emergency guidance.',
    'Operations',
    'in_progress',
    '1'
  ),
  (
    'WF-URBAN-CREST-003',
    'Janitorial Daily Standing Orders',
    'Daily housekeeping and janitorial operating workflow based on the Urban Crest janitor standing orders.',
    'Operations',
    'in_progress',
    '1'
  ),
  (
    'WF-URBAN-CREST-004',
    'Utility Disconnection for Non-Payment',
    'Recovery and service discontinuation workflow for unpaid management dues based on the approved utility disconnection procedure.',
    'Finance',
    'in_progress',
    '1'
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  department = excluded.department,
  status = excluded.status,
  created_by = excluded.created_by;

insert into public.project_workflows (project_id, workflow_id)
values
  ('PRJ-URBAN-CREST-001', 'WF-URBAN-CREST-001'),
  ('PRJ-URBAN-CREST-001', 'WF-URBAN-CREST-002'),
  ('PRJ-URBAN-CREST-001', 'WF-URBAN-CREST-003'),
  ('PRJ-URBAN-CREST-001', 'WF-URBAN-CREST-004')
on conflict (project_id, workflow_id) do nothing;

delete from public.workflow_departments
where workflow_id in (
  'WF-URBAN-CREST-001',
  'WF-URBAN-CREST-002',
  'WF-URBAN-CREST-003',
  'WF-URBAN-CREST-004'
);

insert into public.workflow_departments (workflow_id, department, sort_order)
values
  ('WF-URBAN-CREST-001', 'Operations', 1),
  ('WF-URBAN-CREST-001', 'Administration', 2),
  ('WF-URBAN-CREST-001', 'Security', 3),
  ('WF-URBAN-CREST-002', 'Operations', 1),
  ('WF-URBAN-CREST-002', 'Maintenance', 2),
  ('WF-URBAN-CREST-002', 'Security', 3),
  ('WF-URBAN-CREST-003', 'Operations', 1),
  ('WF-URBAN-CREST-003', 'Housekeeping', 2),
  ('WF-URBAN-CREST-004', 'Finance', 1),
  ('WF-URBAN-CREST-004', 'Operations', 2),
  ('WF-URBAN-CREST-004', 'Management', 3);

delete from public.workflow_steps
where workflow_id in (
  'WF-URBAN-CREST-001',
  'WF-URBAN-CREST-002',
  'WF-URBAN-CREST-003',
  'WF-URBAN-CREST-004'
);

insert into public.workflow_steps (
  id,
  workflow_id,
  name,
  status,
  assigned_to,
  step_order,
  portal_enabled,
  direct_upload_enabled
)
values
  ('STEP-UC-001-01', 'WF-URBAN-CREST-001', 'Receive owner, tenant, visitor, or resident administration request', 'completed', '2', 1, true, true),
  ('STEP-UC-001-02', 'WF-URBAN-CREST-001', 'Verify apartment details, resident identity, and supporting records', 'completed', '1', 2, true, true),
  ('STEP-UC-001-03', 'WF-URBAN-CREST-001', 'Register tenant, housemaid, driver, visitor, or ownership change details', 'in_progress', '2', 3, true, true),
  ('STEP-UC-001-04', 'WF-URBAN-CREST-001', 'Issue resident card, access card, or vehicle pass and update handover records', 'pending', '1', 4, true, true),
  ('STEP-UC-001-05', 'WF-URBAN-CREST-001', 'Notify security and close occupancy administration request', 'pending', '2', 5, true, false),

  ('STEP-UC-002-01', 'WF-URBAN-CREST-002', 'Receive emergency or essential service incident report', 'completed', '2', 1, true, true),
  ('STEP-UC-002-02', 'WF-URBAN-CREST-002', 'Alert management office or security control room with apartment and location details', 'completed', '1', 2, true, false),
  ('STEP-UC-002-03', 'WF-URBAN-CREST-002', 'Assess incident type: fire, lift, plumbing, electrical, CCTV, or power failure', 'in_progress', '2', 3, false, false),
  ('STEP-UC-002-04', 'WF-URBAN-CREST-002', 'Coordinate technician, contractor, or guard response and resident guidance', 'pending', '1', 4, false, false),
  ('STEP-UC-002-05', 'WF-URBAN-CREST-002', 'Restore service, log response details, and close incident', 'pending', '2', 5, true, true),

  ('STEP-UC-003-01', 'WF-URBAN-CREST-003', 'Start shift, report for attendance, and collect cleaning instructions', 'completed', '2', 1, false, false),
  ('STEP-UC-003-02', 'WF-URBAN-CREST-003', 'Prepare cleaning tools, waste collection items, and work areas', 'completed', '2', 2, false, false),
  ('STEP-UC-003-03', 'WF-URBAN-CREST-003', 'Clean tower common areas, lobbies, access ways, and rooftop sections', 'in_progress', '2', 3, false, false),
  ('STEP-UC-003-04', 'WF-URBAN-CREST-003', 'Clear garbage handling points and maintain chute-related common areas safely', 'pending', '2', 4, false, false),
  ('STEP-UC-003-05', 'WF-URBAN-CREST-003', 'Perform end-of-day inspection, final cleaning round, and handover', 'pending', '2', 5, false, false),

  ('STEP-UC-004-01', 'WF-URBAN-CREST-004', 'Issue invoice with 14-day due date and start payment follow-up', 'completed', '3', 1, true, true),
  ('STEP-UC-004-02', 'WF-URBAN-CREST-004', 'Send first reminder with statement of outstanding dues', 'completed', '3', 2, true, true),
  ('STEP-UC-004-03', 'WF-URBAN-CREST-004', 'Prepare final letter with council authorization and 14-day settlement notice', 'in_progress', '1', 3, true, true),
  ('STEP-UC-004-04', 'WF-URBAN-CREST-004', 'Issue service discontinuation notice to owner, tenant, and authority copy list', 'pending', '2', 4, true, true),
  ('STEP-UC-004-05', 'WF-URBAN-CREST-004', 'Disconnect utilities if unpaid after deadline using approved technical supervision', 'pending', '1', 5, false, false),
  ('STEP-UC-004-06', 'WF-URBAN-CREST-004', 'Reconnect service after full settlement and reconnection fee payment', 'pending', '3', 6, true, true);
