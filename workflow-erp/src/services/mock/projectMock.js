// Project data starts empty until users create records in the app.
export const mockProjects = [];

export const projectService = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true, data: mockProjects };
  },

  getById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const project = mockProjects.find((p) => p.id === id);
    return project
      ? { success: true, data: project }
      : { success: false, error: 'Project not found' };
  },

  create: async (projectData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newProject = {
      id: `PRJ-${String(mockProjects.length + 1).padStart(3, '0')}`,
      ...projectData,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProjects.push(newProject);
    return { success: true, data: newProject };
  },

  update: async (id, updates) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Project not found' };
    }
    mockProjects[index] = { ...mockProjects[index], ...updates, updatedAt: new Date().toISOString() };
    return { success: true, data: mockProjects[index] };
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Project not found' };
    }
    mockProjects.splice(index, 1);
    return { success: true };
  },
};
