import { getSupabaseConfigError, hasSupabaseConfig, supabase } from '../../utils/supabaseClient';

const TABLES = {
  users: 'app_users',
  workflows: 'workflows',
  workflowDepartments: 'workflow_departments',
  workflowSteps: 'workflow_steps',
  documents: 'documents',
  projects: 'projects',
  projectWorkflows: 'project_workflows',
  projectTeamMembers: 'project_team_members',
  approvals: 'approvals',
  approvalComments: 'approval_comments',
  approvalHistory: 'approval_history',
  notifications: 'notifications',
};

const configErrorResult = () => ({ success: false, error: getSupabaseConfigError() });

const ensureClient = () => {
  if (!hasSupabaseConfig || !supabase) {
    return configErrorResult();
  }

  return null;
};

const generateId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 KB';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formattedValue = value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1);
  return `${formattedValue} ${units[unitIndex]}`;
};

const groupBy = (items, key) =>
  items.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});

const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department,
  phone: row.phone,
  avatar: row.avatar,
  isActive: row.is_active,
  createdAt: row.created_at,
  lastLogin: row.last_login,
});

const mapDocument = (row) => ({
  id: row.id,
  workflowId: row.workflow_id,
  workflowName: row.workflow_name,
  stepId: row.step_id,
  stepName: row.step_name,
  name: row.name,
  description: row.description || '',
  category: row.category,
  size: row.size,
  sizeBytes: row.size_bytes,
  type: row.type,
  content: row.content,
  originalFileName: row.original_file_name,
  downloadUrl: row.public_url,
  publicUrl: row.public_url,
  storagePath: row.storage_path,
  uploadedBy: row.uploaded_by,
  uploadedByName: row.uploaded_by_name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapWorkflow = (row, departmentsByWorkflow, stepsByWorkflow) => {
  const steps = (stepsByWorkflow[row.id] || [])
    .sort((a, b) => a.step_order - b.step_order)
    .map((step) => ({
      id: step.id,
      name: step.name,
      status: step.status,
      assignedTo: step.assigned_to,
      order: step.step_order,
      portalEnabled: step.portal_enabled,
      directUploadEnabled: step.direct_upload_enabled,
      portalDeadline: step.portal_deadline,
      signature: step.signature,
    }));

  const departments = (departmentsByWorkflow[row.id] || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.department);

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    department: row.department || departments[0] || '',
    departments,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps,
  };
};

const mapProject = (row, workflowLinksByProject, teamByProject) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  status: row.status,
  manager: row.manager,
  managerName: row.manager_name,
  startDate: row.start_date,
  endDate: row.end_date,
  progress: row.progress,
  workflowIds: (workflowLinksByProject[row.id] || []).map((item) => item.workflow_id),
  teamMembers: (teamByProject[row.id] || []).map((item) => item.user_id),
  teamMemberNames: (teamByProject[row.id] || []).map((item) => item.user_name),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapApproval = (row, commentsByApproval, historyByApproval) => ({
  id: row.id,
  requestType: row.request_type,
  projectId: row.project_id,
  projectName: row.project_name,
  workflowId: row.workflow_id,
  workflowName: row.workflow_name,
  stepId: row.step_id,
  stepName: row.step_name,
  requestedBy: row.requested_by,
  requestedByName: row.requested_by_name,
  assignedTo: row.assigned_to,
  assignedToName: row.assigned_to_name,
  status: row.status,
  dueDate: row.due_date,
  requestedAt: row.requested_at,
  decidedAt: row.decided_at,
  signature: row.signature,
  comments: (commentsByApproval[row.id] || []).sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  ).map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    userName: comment.user_name,
    text: comment.text,
    signature: comment.signature,
    createdAt: comment.created_at,
  })),
  history: (historyByApproval[row.id] || []).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  ).map((entry) => ({
    action: entry.action,
    userId: entry.user_id,
    userName: entry.user_name,
    comment: entry.comment,
    signature: entry.signature,
    timestamp: entry.timestamp,
  })),
});

const mapNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  message: row.message,
  link: row.link,
  read: row.read,
  createdAt: row.created_at,
});

const recomputeWorkflowStatus = async (workflowId) => {
  const clientError = ensureClient();
  if (clientError) return clientError;

  const { data: steps, error: stepsError } = await supabase
    .from(TABLES.workflowSteps)
    .select('status')
    .eq('workflow_id', workflowId);

  if (stepsError) {
    return { success: false, error: stepsError.message };
  }

  let status = 'pending';
  if (steps.length > 0 && steps.every((step) => step.status === 'completed')) {
    status = 'completed';
  } else if (steps.some((step) => step.status === 'in_progress' || step.status === 'completed')) {
    status = 'in_progress';
  }

  const { error } = await supabase
    .from(TABLES.workflows)
    .update({ status })
    .eq('id', workflowId);

  return error ? { success: false, error: error.message } : { success: true };
};

const fetchWorkflowsInternal = async (workflowId = null) => {
  const clientError = ensureClient();
  if (clientError) return clientError;

  let workflowQuery = supabase.from(TABLES.workflows).select('*').order('created_at', { ascending: false });
  if (workflowId) {
    workflowQuery = workflowQuery.eq('id', workflowId);
  }

  const { data: workflows, error: workflowError } = await workflowQuery;
  if (workflowError) {
    return { success: false, error: workflowError.message };
  }

  if (!workflows.length) {
    return { success: true, data: workflowId ? null : [] };
  }

  const workflowIds = workflows.map((workflow) => workflow.id);

  const { data: departments, error: departmentError } = await supabase
    .from(TABLES.workflowDepartments)
    .select('*')
    .in('workflow_id', workflowIds);

  if (departmentError) {
    return { success: false, error: departmentError.message };
  }

  const { data: steps, error: stepsError } = await supabase
    .from(TABLES.workflowSteps)
    .select('*')
    .in('workflow_id', workflowIds);

  if (stepsError) {
    return { success: false, error: stepsError.message };
  }

  const departmentsByWorkflow = groupBy(departments, 'workflow_id');
  const stepsByWorkflow = groupBy(steps, 'workflow_id');
  const mapped = workflows.map((workflow) => mapWorkflow(workflow, departmentsByWorkflow, stepsByWorkflow));

  return { success: true, data: workflowId ? mapped[0] || null : mapped };
};

const fetchProjectsInternal = async (projectId = null) => {
  const clientError = ensureClient();
  if (clientError) return clientError;

  let projectQuery = supabase.from(TABLES.projects).select('*').order('created_at', { ascending: false });
  if (projectId) {
    projectQuery = projectQuery.eq('id', projectId);
  }

  const { data: projects, error: projectError } = await projectQuery;
  if (projectError) {
    return { success: false, error: projectError.message };
  }

  if (!projects.length) {
    return { success: true, data: projectId ? null : [] };
  }

  const projectIds = projects.map((project) => project.id);

  const { data: workflowLinks, error: workflowLinkError } = await supabase
    .from(TABLES.projectWorkflows)
    .select('*')
    .in('project_id', projectIds);

  if (workflowLinkError) {
    return { success: false, error: workflowLinkError.message };
  }

  const { data: teamMembers, error: teamMemberError } = await supabase
    .from(TABLES.projectTeamMembers)
    .select('*')
    .in('project_id', projectIds);

  if (teamMemberError) {
    return { success: false, error: teamMemberError.message };
  }

  const workflowLinksByProject = groupBy(workflowLinks, 'project_id');
  const teamByProject = groupBy(teamMembers, 'project_id');
  const mapped = projects.map((project) => mapProject(project, workflowLinksByProject, teamByProject));

  return { success: true, data: projectId ? mapped[0] || null : mapped };
};

const fetchApprovalsInternal = async (approvalId = null) => {
  const clientError = ensureClient();
  if (clientError) return clientError;

  let approvalQuery = supabase.from(TABLES.approvals).select('*').order('requested_at', { ascending: false });
  if (approvalId) {
    approvalQuery = approvalQuery.eq('id', approvalId);
  }

  const { data: approvals, error: approvalsError } = await approvalQuery;
  if (approvalsError) {
    return { success: false, error: approvalsError.message };
  }

  if (!approvals.length) {
    return { success: true, data: approvalId ? null : [] };
  }

  const approvalIds = approvals.map((approval) => approval.id);

  const { data: comments, error: commentsError } = await supabase
    .from(TABLES.approvalComments)
    .select('*')
    .in('approval_id', approvalIds);

  if (commentsError) {
    return { success: false, error: commentsError.message };
  }

  const { data: history, error: historyError } = await supabase
    .from(TABLES.approvalHistory)
    .select('*')
    .in('approval_id', approvalIds);

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  const commentsByApproval = groupBy(comments, 'approval_id');
  const historyByApproval = groupBy(history, 'approval_id');
  const mapped = approvals.map((approval) => mapApproval(approval, commentsByApproval, historyByApproval));

  return { success: true, data: approvalId ? mapped[0] || null : mapped };
};

export const authService = {
  login: async (username, password) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase.rpc('app_login_v2', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = Array.isArray(data) ? data[0] : data;
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user.is_active) {
      return { success: false, error: 'Account is disabled. Contact administrator.' };
    }

    return { success: true, user: mapUser(user) };
  },

  logout: async () => ({ success: true }),

  getCurrentUser: async () => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  getAllUsers: async () => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.users)
      .select('id, username, name, email, role, department, phone, avatar, is_active, created_at, last_login')
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapUser) };
  },

  getUserById: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.users)
      .select('id, username, name, email, role, department, phone, avatar, is_active, created_at, last_login')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return data ? { success: true, data: mapUser(data) } : { success: false, error: 'User not found' };
  },

  createUser: async (userData) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const newUserId = userData.id || generateId('USER');
    const { data, error } = await supabase.rpc('app_create_user_v2', {
      p_id: newUserId,
      p_username: userData.username,
      p_password: userData.password,
      p_name: userData.name,
      p_email: userData.email,
      p_role: userData.role,
      p_department: userData.department,
      p_phone: userData.phone || null,
      p_avatar: userData.avatar || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const createdUser = Array.isArray(data) ? data[0] : data;
    return { success: true, data: mapUser(createdUser) };
  },

  updateUser: async (id, updates) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const payload = {
      username: updates.username,
      name: updates.name,
      email: updates.email,
      role: updates.role,
      department: updates.department,
      phone: updates.phone ?? null,
      avatar: updates.avatar ?? null,
      is_active: updates.isActive,
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase
      .from(TABLES.users)
      .update(payload)
      .eq('id', id)
      .select('id, username, name, email, role, department, phone, avatar, is_active, created_at, last_login')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return data ? { success: true, data: mapUser(data) } : { success: false, error: 'User not found' };
  },

  deleteUser: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error } = await supabase.from(TABLES.users).delete().eq('id', id);
    return error ? { success: false, error: error.message } : { success: true };
  },

  toggleUserStatus: async (id) => {
    const fetchResult = await authService.getUserById(id);
    if (!fetchResult.success) {
      return fetchResult;
    }

    return authService.updateUser(id, { isActive: !fetchResult.data.isActive });
  },

  changePassword: async (id, newPassword) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase.rpc('app_change_password_v2', {
      p_user_id: id,
      p_new_password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data ? { success: true } : { success: false, error: 'User not found' };
  },

  getUsersByRole: async (role) => {
    const result = await authService.getAllUsers();
    if (!result.success) return result;
    return { success: true, data: result.data.filter((user) => user.role === role && user.isActive) };
  },

  getActiveUsers: async () => {
    const result = await authService.getAllUsers();
    if (!result.success) return result;
    return { success: true, data: result.data.filter((user) => user.isActive) };
  },
};

export const workflowService = {
  getAll: async () => fetchWorkflowsInternal(),

  getById: async (id) => {
    const result = await fetchWorkflowsInternal(id);
    return result.success && result.data
      ? result
      : { success: false, error: result.error || 'Workflow not found' };
  },

  create: async (workflowData) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const workflowId = workflowData.id || generateId('WF');
    const steps = (workflowData.steps || []).map((step, index) => ({
      id: step.id || generateId('STEP'),
      workflow_id: workflowId,
      name: step.name,
      status: step.status || 'pending',
      assigned_to: step.assignedTo || null,
      step_order: step.order || index + 1,
      portal_enabled: Boolean(step.portalEnabled),
      direct_upload_enabled: Boolean(step.directUploadEnabled),
      portal_deadline: step.portalDeadline || null,
    }));

    const { error: workflowError } = await supabase.from(TABLES.workflows).insert({
      id: workflowId,
      name: workflowData.name,
      description: workflowData.description || '',
      department: workflowData.department || workflowData.departments?.[0] || null,
      status: workflowData.status || 'pending',
      created_by: workflowData.createdBy || null,
    });

    if (workflowError) {
      return { success: false, error: workflowError.message };
    }

    const departmentsPayload = (workflowData.departments || []).map((department, index) => ({
      workflow_id: workflowId,
      department,
      sort_order: index + 1,
    }));

    if (departmentsPayload.length) {
      const { error: departmentError } = await supabase
        .from(TABLES.workflowDepartments)
        .insert(departmentsPayload);

      if (departmentError) {
        return { success: false, error: departmentError.message };
      }
    }

    if (steps.length) {
      const { error: stepsError } = await supabase.from(TABLES.workflowSteps).insert(steps);
      if (stepsError) {
        return { success: false, error: stepsError.message };
      }
    }

    return workflowService.getById(workflowId);
  },

  update: async (id, updates) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error: workflowError } = await supabase
      .from(TABLES.workflows)
      .update({
        name: updates.name,
        description: updates.description || '',
        department: updates.department || updates.departments?.[0] || null,
        status: updates.status,
      })
      .eq('id', id);

    if (workflowError) {
      return { success: false, error: workflowError.message };
    }

    if (updates.departments) {
      const { error: deleteDepartmentsError } = await supabase
        .from(TABLES.workflowDepartments)
        .delete()
        .eq('workflow_id', id);

      if (deleteDepartmentsError) {
        return { success: false, error: deleteDepartmentsError.message };
      }

      const departmentsPayload = updates.departments.map((department, index) => ({
        workflow_id: id,
        department,
        sort_order: index + 1,
      }));

      if (departmentsPayload.length) {
        const { error: departmentsInsertError } = await supabase
          .from(TABLES.workflowDepartments)
          .insert(departmentsPayload);

        if (departmentsInsertError) {
          return { success: false, error: departmentsInsertError.message };
        }
      }
    }

    if (updates.steps) {
      const stepIds = updates.steps.map((step) => step.id || generateId('STEP'));
      const { data: existingSteps, error: existingStepsError } = await supabase
        .from(TABLES.workflowSteps)
        .eq('workflow_id', id)
        .select('id, signature');

      if (existingStepsError) {
        return { success: false, error: existingStepsError.message };
      }

      const existingStepIds = (existingSteps || []).map((step) => step.id);
      const removedStepIds = existingStepIds.filter((existingStepId) => !stepIds.includes(existingStepId));

      if (removedStepIds.length) {
        const { error: deleteRemovedStepsError } = await supabase
          .from(TABLES.workflowSteps)
          .delete()
          .in('id', removedStepIds);

        if (deleteRemovedStepsError) {
          return { success: false, error: deleteRemovedStepsError.message };
        }
      }

      const stepsPayload = updates.steps.map((step, index) => {
        const existing = existingSteps?.find((s) => s.id === step.id);
        return {
          id: step.id || stepIds[index],
          workflow_id: id,
          name: step.name,
          status: step.status || 'pending',
          assigned_to: step.assignedTo || null,
          step_order: step.order || index + 1,
          portal_enabled: Boolean(step.portalEnabled),
          direct_upload_enabled: Boolean(step.directUploadEnabled),
          portal_deadline: step.portalDeadline || null,
          signature: step.signature || existing?.signature || null,
        };
      });

      const { error: stepsError } = await supabase
        .from(TABLES.workflowSteps)
        .upsert(stepsPayload, { onConflict: 'id' });

      if (stepsError) {
        return { success: false, error: stepsError.message };
      }
    }

    return workflowService.getById(id);
  },

  updateStepStatus: async (workflowId, stepId, status, signature = null) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const updatePayload = { status };
    if (signature) {
      updatePayload.signature = signature;
    }

    const { error } = await supabase
      .from(TABLES.workflowSteps)
      .update(updatePayload)
      .eq('id', stepId)
      .eq('workflow_id', workflowId);

    if (error) {
      return { success: false, error: error.message };
    }

    const statusResult = await recomputeWorkflowStatus(workflowId);
    if (!statusResult.success) {
      return statusResult;
    }

    return workflowService.getById(workflowId);
  },

  delete: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error } = await supabase.from(TABLES.workflows).delete().eq('id', id);
    return error ? { success: false, error: error.message } : { success: true };
  },
};

export const projectService = {
  getAll: async () => fetchProjectsInternal(),

  getById: async (id) => {
    const result = await fetchProjectsInternal(id);
    return result.success && result.data
      ? result
      : { success: false, error: result.error || 'Project not found' };
  },

  create: async (projectData) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const projectId = projectData.id || generateId('PRJ');
    const { error: projectError } = await supabase.from(TABLES.projects).insert({
      id: projectId,
      name: projectData.name,
      description: projectData.description || '',
      status: projectData.status || 'pending_approval',
      manager: projectData.manager || null,
      manager_name: projectData.managerName || null,
      start_date: projectData.startDate || null,
      end_date: projectData.endDate || null,
      progress: projectData.progress ?? 0,
    });

    if (projectError) {
      return { success: false, error: projectError.message };
    }

    if (projectData.workflowIds?.length) {
      const { error: workflowError } = await supabase.from(TABLES.projectWorkflows).insert(
        projectData.workflowIds.map((workflowId) => ({
          project_id: projectId,
          workflow_id: workflowId,
        }))
      );

      if (workflowError) {
        return { success: false, error: workflowError.message };
      }
    }

    if (projectData.teamMembers?.length) {
      const { error: memberError } = await supabase.from(TABLES.projectTeamMembers).insert(
        projectData.teamMembers.map((memberId, index) => ({
          project_id: projectId,
          user_id: memberId,
          user_name: projectData.teamMemberNames?.[index] || null,
        }))
      );

      if (memberError) {
        return { success: false, error: memberError.message };
      }
    }

    return projectService.getById(projectId);
  },

  update: async (id, updates) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error: projectError } = await supabase
      .from(TABLES.projects)
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status,
        manager: updates.manager,
        manager_name: updates.managerName,
        start_date: updates.startDate,
        end_date: updates.endDate,
        progress: updates.progress,
      })
      .eq('id', id);

    if (projectError) {
      return { success: false, error: projectError.message };
    }

    if (updates.workflowIds) {
      const { error: deleteWorkflowsError } = await supabase
        .from(TABLES.projectWorkflows)
        .delete()
        .eq('project_id', id);

      if (deleteWorkflowsError) {
        return { success: false, error: deleteWorkflowsError.message };
      }

      if (updates.workflowIds.length) {
        const { error: insertWorkflowsError } = await supabase.from(TABLES.projectWorkflows).insert(
          updates.workflowIds.map((workflowId) => ({
            project_id: id,
            workflow_id: workflowId,
          }))
        );

        if (insertWorkflowsError) {
          return { success: false, error: insertWorkflowsError.message };
        }
      }
    }

    if (updates.teamMembers) {
      const { error: deleteMembersError } = await supabase
        .from(TABLES.projectTeamMembers)
        .delete()
        .eq('project_id', id);

      if (deleteMembersError) {
        return { success: false, error: deleteMembersError.message };
      }

      if (updates.teamMembers.length) {
        const { error: insertMembersError } = await supabase.from(TABLES.projectTeamMembers).insert(
          updates.teamMembers.map((memberId, index) => ({
            project_id: id,
            user_id: memberId,
            user_name: updates.teamMemberNames?.[index] || null,
          }))
        );

        if (insertMembersError) {
          return { success: false, error: insertMembersError.message };
        }
      }
    }

    return projectService.getById(id);
  },

  delete: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error } = await supabase.from(TABLES.projects).delete().eq('id', id);
    return error ? { success: false, error: error.message } : { success: true };
  },
};

export const approvalService = {
  getAll: async () => fetchApprovalsInternal(),

  getById: async (id) => {
    const result = await fetchApprovalsInternal(id);
    return result.success && result.data
      ? result
      : { success: false, error: result.error || 'Approval not found' };
  },

  getByAssignedTo: async (userId) => {
    const result = await approvalService.getAll();
    if (!result.success) return result;
    return { success: true, data: result.data.filter((approval) => approval.assignedTo === userId) };
  },

  create: async (approvalData) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const approvalId = approvalData.id || generateId('APP');
    const comments = approvalData.comments || [];
    const history = approvalData.history || [];

    const { error: approvalError } = await supabase.from(TABLES.approvals).insert({
      id: approvalId,
      request_type: approvalData.requestType || 'workflow',
      project_id: approvalData.projectId || null,
      project_name: approvalData.projectName || null,
      workflow_id: approvalData.workflowId || null,
      workflow_name: approvalData.workflowName || null,
      step_id: approvalData.stepId || null,
      step_name: approvalData.stepName || null,
      requested_by: approvalData.requestedBy || null,
      requested_by_name: approvalData.requestedByName || null,
      assigned_to: approvalData.assignedTo || null,
      assigned_to_name: approvalData.assignedToName || null,
      status: approvalData.status || 'pending',
      due_date: approvalData.dueDate || null,
      requested_at: approvalData.requestedAt || new Date().toISOString(),
      decided_at: approvalData.decidedAt || null,
      signature: approvalData.signature || null,
    });

    if (approvalError) {
      return { success: false, error: approvalError.message };
    }

    if (comments.length) {
      const { error: commentsError } = await supabase.from(TABLES.approvalComments).insert(
        comments.map((comment) => ({
          id: comment.id || generateId('COM'),
          approval_id: approvalId,
          user_id: comment.userId || null,
          user_name: comment.userName || null,
          text: comment.text,
          signature: comment.signature || null,
          created_at: comment.createdAt || new Date().toISOString(),
        }))
      );

      if (commentsError) {
        return { success: false, error: commentsError.message };
      }
    }

    if (history.length) {
      const { error: historyError } = await supabase.from(TABLES.approvalHistory).insert(
        history.map((entry) => ({
          id: entry.id || generateId('HIS'),
          approval_id: approvalId,
          action: entry.action,
          user_id: entry.userId || null,
          user_name: entry.userName || null,
          comment: entry.comment || null,
          signature: entry.signature || null,
          timestamp: entry.timestamp || new Date().toISOString(),
        }))
      );

      if (historyError) {
        return { success: false, error: historyError.message };
      }
    }

    return approvalService.getById(approvalId);
  },

  approve: async (id, comment, signature, actor) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    if (!signature || !signature.trim()) {
      return { success: false, error: 'E-signature is required' };
    }

    const decidedAt = new Date().toISOString();

    const { error: approvalError } = await supabase
      .from(TABLES.approvals)
      .update({
        status: 'approved',
        decided_at: decidedAt,
        signature,
      })
      .eq('id', id);

    if (approvalError) {
      return { success: false, error: approvalError.message };
    }

    const commentRow = {
      id: generateId('COM'),
      approval_id: id,
      user_id: actor?.id || null,
      user_name: actor?.name || null,
      text: comment || 'Approved',
      signature,
      created_at: decidedAt,
    };

    const historyRow = {
      id: generateId('HIS'),
      approval_id: id,
      action: 'approved',
      user_id: actor?.id || null,
      user_name: actor?.name || null,
      comment: comment || 'Approved',
      signature,
      timestamp: decidedAt,
    };

    const { error: commentError } = await supabase.from(TABLES.approvalComments).insert(commentRow);
    if (commentError) {
      return { success: false, error: commentError.message };
    }

    const { error: historyError } = await supabase.from(TABLES.approvalHistory).insert(historyRow);
    if (historyError) {
      return { success: false, error: historyError.message };
    }

    return approvalService.getById(id);
  },

  reject: async (id, comment, signature, actor) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    if (!signature || !signature.trim()) {
      return { success: false, error: 'E-signature is required' };
    }

    const decidedAt = new Date().toISOString();

    const { error: approvalError } = await supabase
      .from(TABLES.approvals)
      .update({
        status: 'rejected',
        decided_at: decidedAt,
        signature,
      })
      .eq('id', id);

    if (approvalError) {
      return { success: false, error: approvalError.message };
    }

    const commentRow = {
      id: generateId('COM'),
      approval_id: id,
      user_id: actor?.id || null,
      user_name: actor?.name || null,
      text: comment,
      signature,
      created_at: decidedAt,
    };

    const historyRow = {
      id: generateId('HIS'),
      approval_id: id,
      action: 'rejected',
      user_id: actor?.id || null,
      user_name: actor?.name || null,
      comment,
      signature,
      timestamp: decidedAt,
    };

    const { error: commentError } = await supabase.from(TABLES.approvalComments).insert(commentRow);
    if (commentError) {
      return { success: false, error: commentError.message };
    }

    const { error: historyError } = await supabase.from(TABLES.approvalHistory).insert(historyRow);
    if (historyError) {
      return { success: false, error: historyError.message };
    }

    return approvalService.getById(id);
  },

  addComment: async (id, userId, userName, text) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error } = await supabase.from(TABLES.approvalComments).insert({
      id: generateId('COM'),
      approval_id: id,
      user_id: userId || null,
      user_name: userName || null,
      text,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return approvalService.getById(id);
  },
};

export const documentService = {
  getAll: async () => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.documents)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapDocument) };
  },

  getById: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.documents)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return data ? { success: true, data: mapDocument(data) } : { success: false, error: 'Document not found' };
  },

  getByWorkflow: async (workflowId) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.documents)
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapDocument) };
  },

  getByStepId: async (stepId) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.documents)
      .select('*')
      .eq('step_id', stepId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapDocument) };
  },

  download: async (id) => {
    const fetchResult = await documentService.getById(id);
    if (!fetchResult.success) {
      return fetchResult;
    }

    const doc = fetchResult.data;
    if (doc.publicUrl) {
      const anchor = document.createElement('a');
      anchor.href = doc.publicUrl;
      anchor.download = doc.originalFileName || doc.name;
      anchor.target = '_blank';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return { success: true, data: doc };
    }

    const blob = new Blob([doc.content || `Content for ${doc.name}`], { type: doc.type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = doc.originalFileName || doc.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return { success: true, data: doc };
  },

  create: async (docData) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const documentId = docData.id || generateId('DOC');
    const file = docData.file || null;
    let publicUrl = null;
    let storagePath = null;
    let content = docData.content || null;

    if (file) {
      storagePath = `${docData.workflowId || 'general'}/${documentId}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, { upsert: true });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(storagePath);
      publicUrl = publicUrlData.publicUrl;
      content = content || `Uploaded file: ${file.name}`;
    }

    const { error } = await supabase.from(TABLES.documents).insert({
      id: documentId,
      workflow_id: docData.workflowId || null,
      workflow_name: docData.workflowName || null,
      step_id: docData.stepId || null,
      step_name: docData.stepName || null,
      name: docData.name,
      description: docData.description || '',
      category: docData.category || 'other',
      size_bytes: file?.size || 0,
      size: file ? formatFileSize(file.size) : '0 KB',
      type: file?.type || docData.type || 'application/octet-stream',
      content,
      original_file_name: file?.name || docData.originalFileName || docData.name,
      storage_path: storagePath,
      public_url: publicUrl,
      uploaded_by: docData.uploadedBy || null,
      uploaded_by_name: docData.uploadedByName || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return documentService.getById(documentId);
  },

  delete: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const fetchResult = await documentService.getById(id);
    if (!fetchResult.success) {
      return fetchResult;
    }

    if (fetchResult.data.storagePath) {
      await supabase.storage.from('documents').remove([fetchResult.data.storagePath]);
    }

    const { error } = await supabase.from(TABLES.documents).delete().eq('id', id);
    return error ? { success: false, error: error.message } : { success: true };
  },

  search: async (query) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const normalized = query.trim();
    if (!normalized) {
      return documentService.getAll();
    }

    const escaped = normalized.replace(/[%(),]/g, ' ');
    const { data, error } = await supabase
      .from(TABLES.documents)
      .select('*')
      .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%,category.ilike.%${escaped}%`)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapDocument) };
  },
};

export const notificationService = {
  getAll: async (userId) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.notifications)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapNotification) };
  },

  getUnread: async (userId) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.notifications)
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.map(mapNotification) };
  },

  markAsRead: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { data, error } = await supabase
      .from(TABLES.notifications)
      .update({ read: true })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return data ? { success: true, data: mapNotification(data) } : { success: false, error: 'Notification not found' };
  },

  markAllAsRead: async (userId) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error } = await supabase
      .from(TABLES.notifications)
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    return error ? { success: false, error: error.message } : { success: true };
  },

  create: async (notification) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const notificationId = notification.id || generateId('NOTIF');
    const { data, error } = await supabase
      .from(TABLES.notifications)
      .insert({
        id: notificationId,
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link || null,
        read: false,
      })
      .select('*')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: mapNotification(data) };
  },

  delete: async (id) => {
    const clientError = ensureClient();
    if (clientError) return clientError;

    const { error } = await supabase.from(TABLES.notifications).delete().eq('id', id);
    return error ? { success: false, error: error.message } : { success: true };
  },
};
