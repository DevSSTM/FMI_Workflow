import { mockProjects } from './projectMock';

// Approval data starts empty until users create records in the app.
export const mockApprovals = [];

const syncProjectStatusFromApprovals = (projectId) => {
  if (!projectId) return;

  const project = mockProjects.find((item) => item.id === projectId);
  if (!project) return;

  const projectApprovals = mockApprovals.filter(
    (approval) => approval.requestType === 'project' && approval.projectId === projectId
  );

  if (projectApprovals.some((approval) => approval.status === 'rejected')) {
    project.status = 'cancelled';
  } else if (
    projectApprovals.length > 0 &&
    projectApprovals.every((approval) => approval.status === 'approved')
  ) {
    project.status = 'planning';
  } else {
    project.status = 'pending_approval';
  }

  project.updatedAt = new Date().toISOString();
};

export const approvalService = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockApprovals };
  },

  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const approval = mockApprovals.find((a) => a.id === id);
    return approval
      ? { success: true, data: approval }
      : { success: false, error: 'Approval not found' };
  },

  getByAssignedTo: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const approvals = mockApprovals.filter((a) => a.assignedTo === userId);
    return { success: true, data: approvals };
  },

  create: async (approvalData) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newApproval = {
      id: `APP-${String(mockApprovals.length + 1).padStart(3, '0')}`,
      status: 'pending',
      comments: [],
      history: [],
      ...approvalData,
    };

    mockApprovals.push(newApproval);
    syncProjectStatusFromApprovals(newApproval.projectId);
    return { success: true, data: newApproval };
  },

  approve: async (id, comment, signature, actor) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const approval = mockApprovals.find((a) => a.id === id);
    if (!approval) {
      return { success: false, error: 'Approval not found' };
    }

    if (!signature || !signature.trim()) {
      return { success: false, error: 'E-signature is required' };
    }

    approval.status = 'approved';
    approval.decidedAt = new Date().toISOString();
    approval.signature = signature;
    approval.comments.push({
      id: `c${Date.now()}`,
      userId: actor?.id || approval.assignedTo,
      userName: actor?.name || approval.assignedToName,
      text: comment,
      createdAt: new Date().toISOString(),
      signature,
    });
    approval.history.push({
      action: 'approved',
      userId: actor?.id || approval.assignedTo,
      userName: actor?.name || approval.assignedToName,
      comment,
      signature,
      timestamp: new Date().toISOString(),
    });

    syncProjectStatusFromApprovals(approval.projectId);

    return { success: true, data: approval };
  },

  reject: async (id, comment, signature, actor) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const approval = mockApprovals.find((a) => a.id === id);
    if (!approval) {
      return { success: false, error: 'Approval not found' };
    }

    if (!signature || !signature.trim()) {
      return { success: false, error: 'E-signature is required' };
    }

    approval.status = 'rejected';
    approval.decidedAt = new Date().toISOString();
    approval.signature = signature;
    approval.comments.push({
      id: `c${Date.now()}`,
      userId: actor?.id || approval.assignedTo,
      userName: actor?.name || approval.assignedToName,
      text: comment,
      createdAt: new Date().toISOString(),
      signature,
    });
    approval.history.push({
      action: 'rejected',
      userId: actor?.id || approval.assignedTo,
      userName: actor?.name || approval.assignedToName,
      comment,
      signature,
      timestamp: new Date().toISOString(),
    });

    syncProjectStatusFromApprovals(approval.projectId);

    return { success: true, data: approval };
  },

  addComment: async (id, userId, userName, text) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const approval = mockApprovals.find((a) => a.id === id);
    if (!approval) {
      return { success: false, error: 'Approval not found' };
    }

    approval.comments.push({
      id: `c${Date.now()}`,
      userId,
      userName,
      text,
      createdAt: new Date().toISOString(),
    });

    return { success: true, data: approval };
  },
};
