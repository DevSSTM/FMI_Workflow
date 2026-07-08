import { create } from 'zustand';
import { userApi } from '../../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.login(username, password);
      if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        set({ user: result.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false, error: result.error });
      }
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  logout: async () => {
    await userApi.logout();
    localStorage.removeItem('currentUser');
    set({ user: null, isAuthenticated: false });
  },
  
  initialize: async () => {
    const user = await userApi.getCurrentUser();
    if (user) {
      const latestUserResult = user.id ? await userApi.getUserById(user.id) : null;
      const latestUser = latestUserResult?.success ? latestUserResult.data : user;
      localStorage.setItem('currentUser', JSON.stringify(latestUser));
      set({ user: latestUser, isAuthenticated: true });
    }
  },
  
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    if (permission === 'all') return true;
    
    const rolePermissions = {
      admin: ['all'],
      manager: ['approve', 'create_workflow', 'manage_projects', 'view_reports', 'manage_users'],
      staff: ['view_tasks', 'submit_documents', 'comment'],
    };
    
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('all') || permissions.includes(permission);
  },
}));
