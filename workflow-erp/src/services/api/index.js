import {
  approvalService,
  authService,
  documentService,
  notificationService,
  projectService,
  workflowService,
} from './supabaseServices';

export const userApi = authService;
export const workflowApi = workflowService;
export const approvalApi = approvalService;
export const projectApi = projectService;
export const documentApi = documentService;
export const notificationApi = notificationService;

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
