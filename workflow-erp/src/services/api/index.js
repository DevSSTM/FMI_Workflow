// API Service Layer - Abstraction for future Supabase integration
// Currently uses mock data, but structured to easily switch to real API calls

import { authService } from '../mock/userMock';
import { workflowService } from '../mock/workflowMock';
import { approvalService } from '../mock/approvalMock';
import { projectService } from '../mock/projectMock';
import { documentService } from '../mock/documentMock';
import { notificationService } from '../mock/notificationMock';

// This is where you would switch to actual API calls when integrating Supabase
// Example:
// import { supabase } from '../../utils/supabaseClient';
// export const userApi = { login: async (username, password) => { const { data, error } = await supabase.auth.signIn... } }

export const userApi = authService;
export const workflowApi = workflowService;
export const approvalApi = approvalService;
export const projectApi = projectService;
export const documentApi = documentService;
export const notificationApi = notificationService;

// Re-export user management methods for clarity
export const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changePassword,
  getUsersByRole,
  getActiveUsers,
} = authService;
