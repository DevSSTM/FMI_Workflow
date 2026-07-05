import { create } from 'zustand';
import { approvalApi } from '../../services/api';

export const useApprovalStore = create((set, get) => ({
  approvals: [],
  currentApproval: null,
  isLoading: false,
  error: null,
  
  fetchApprovals: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.getAll();
      if (result.success) {
        set({ approvals: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchApprovalById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.getById(id);
      if (result.success) {
        set({ currentApproval: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchByAssignedTo: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.getByAssignedTo(userId);
      if (result.success) {
        set({ approvals: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  createApproval: async (approvalData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.create(approvalData);
      if (result.success) {
        set((state) => ({
          approvals: [...state.approvals, result.data],
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
  
  approve: async (id, comment, signature, actor) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.approve(id, comment, signature, actor);
      if (result.success) {
        set((state) => ({
          approvals: state.approvals.map((a) =>
            a.id === id ? result.data : a
          ),
          currentApproval:
            state.currentApproval?.id === id
              ? result.data
              : state.currentApproval,
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
  
  reject: async (id, comment, signature, actor) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.reject(id, comment, signature, actor);
      if (result.success) {
        set((state) => ({
          approvals: state.approvals.map((a) =>
            a.id === id ? result.data : a
          ),
          currentApproval:
            state.currentApproval?.id === id
              ? result.data
              : state.currentApproval,
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
  
  addComment: async (id, userId, userName, text) => {
    set({ isLoading: true, error: null });
    try {
      const result = await approvalApi.addComment(id, userId, userName, text);
      if (result.success) {
        set((state) => ({
          approvals: state.approvals.map((a) =>
            a.id === id ? result.data : a
          ),
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
