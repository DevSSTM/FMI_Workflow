import { create } from 'zustand';
import { workflowApi } from '../../services/api';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  isLoading: false,
  error: null,
  
  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await workflowApi.getAll();
      if (result.success) {
        set({ workflows: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchWorkflowById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await workflowApi.getById(id);
      if (result.success) {
        set({ currentWorkflow: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  createWorkflow: async (workflowData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await workflowApi.create(workflowData);
      if (result.success) {
        set((state) => ({
          workflows: [...state.workflows, result.data],
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
  
  updateWorkflow: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const result = await workflowApi.update(id, updates);
      if (result.success) {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? result.data : w
          ),
          currentWorkflow:
            state.currentWorkflow?.id === id ? result.data : state.currentWorkflow,
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
  
  updateStepStatus: async (workflowId, stepId, status, signature) => {
    set({ isLoading: true, error: null });
    try {
      const result = await workflowApi.updateStepStatus(workflowId, stepId, status, signature);
      if (result.success) {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId ? result.data : w
          ),
          currentWorkflow:
            state.currentWorkflow?.id === workflowId
              ? result.data
              : state.currentWorkflow,
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
  
  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await workflowApi.delete(id);
      if (result.success) {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
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

  duplicateWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Get the original workflow
      const result = await workflowApi.getById(id);
      if (!result.success) {
        set({ isLoading: false, error: result.error });
        return result;
      }

      const original = result.data;
      // Create a copy with a new name and reset status
      const duplicatedWorkflowData = {
        name: `${original.name} (Copy)`,
        description: original.description,
        departments: original.departments || [original.department],
        department: original.department,
        status: 'pending',
        createdBy: original.createdBy,
        steps: original.steps.map((step) => ({
          ...step,
          id: `step-${Date.now()}-${step.id}`, // Generate new step IDs
          status: 'pending', // Reset step status to pending
        })),
      };

      // Create the new workflow
      const createResult = await workflowApi.create(duplicatedWorkflowData);
      set({ isLoading: false });
      return createResult;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
}));
