import { create } from 'zustand';
import { userApi } from '../../services/api';

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.getAllUsers();
      if (result.success) {
        set({ users: result.data, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.createUser(userData);
      if (result.success) {
        set((state) => ({
          users: [...state.users, result.data],
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
  
  updateUser: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.updateUser(id, updates);
      if (result.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? result.data : u
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
  
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.deleteUser(id);
      if (result.success) {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
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
  
  toggleUserStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.toggleUserStatus(id);
      if (result.success) {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? result.data : u
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
  
  changePassword: async (id, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.changePassword(id, newPassword);
      if (result.success) {
        set({ isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  getActiveUsers: () => {
    const { users } = get();
    return users.filter((u) => u.isActive);
  },
  
  getUsersByRole: (role) => {
    const { users } = get();
    return users.filter((u) => u.role === role && u.isActive);
  },
}));
