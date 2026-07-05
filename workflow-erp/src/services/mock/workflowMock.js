// Workflow data starts empty until users create records in the app.
export const mockWorkflows = [];

export const workflowService = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockWorkflows };
  },

  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const workflow = mockWorkflows.find((w) => w.id === id);
    return workflow
      ? { success: true, data: workflow }
      : { success: false, error: 'Workflow not found' };
  },

  create: async (workflowData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newWorkflow = {
      id: `WF-${String(mockWorkflows.length + 1).padStart(3, '0')}`,
      ...workflowData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWorkflows.push(newWorkflow);
    return { success: true, data: newWorkflow };
  },

  update: async (id, updates) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockWorkflows.findIndex((w) => w.id === id);
    if (index === -1) {
      return { success: false, error: 'Workflow not found' };
    }
    mockWorkflows[index] = { ...mockWorkflows[index], ...updates, updatedAt: new Date().toISOString() };
    return { success: true, data: mockWorkflows[index] };
  },

  updateStepStatus: async (workflowId, stepId, status) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const workflow = mockWorkflows.find((w) => w.id === workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }
    const step = workflow.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = status;
      workflow.updatedAt = new Date().toISOString();
      return { success: true, data: workflow };
    }
    return { success: false, error: 'Step not found' };
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockWorkflows.findIndex((w) => w.id === id);
    if (index === -1) {
      return { success: false, error: 'Workflow not found' };
    }
    mockWorkflows.splice(index, 1);
    return { success: true };
  },
};
