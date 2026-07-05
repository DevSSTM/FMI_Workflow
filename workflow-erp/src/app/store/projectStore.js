import { create } from 'zustand';
import { projectApi } from '../../services/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectApi.getAll();
      if (result.success) {
        set({ projects: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectApi.getById(id);
      if (result.success) {
        set({ currentProject: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectApi.create(projectData);
      if (result.success) {
        set((state) => ({
          projects: [...state.projects, result.data],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  updateProject: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectApi.update(id, updates);
      if (result.success) {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? result.data : p
          ),
          currentProject:
            state.currentProject?.id === id ? result.data : state.currentProject,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectApi.delete(id);
      if (result.success) {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          isLoading: false,
        }));
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
}));
