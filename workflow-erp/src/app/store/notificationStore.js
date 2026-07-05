import { create } from 'zustand';
import { notificationApi } from '../../services/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  fetchNotifications: async (userId) => {
    set({ isLoading: true });
    try {
      const result = await notificationApi.getAll(userId);
      if (result.success) {
        const unreadCount = result.data.filter((n) => !n.read).length;
        set({ notifications: result.data, unreadCount, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
  
  fetchUnread: async (userId) => {
    try {
      const result = await notificationApi.getUnread(userId);
      if (result.success) {
        set({ unreadCount: result.data.length });
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  },
  
  markAsRead: async (id) => {
    const result = await notificationApi.markAsRead(id);
    if (result.success) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    }
  },
  
  markAllAsRead: async (userId) => {
    const result = await notificationApi.markAllAsRead(userId);
    if (result.success) {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    }
  },
  
  addNotification: async (notification) => {
    const result = await notificationApi.create(notification);
    if (result.success) {
      set((state) => ({
        notifications: [result.data, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    }
  },
  
  deleteNotification: async (id) => {
    const result = await notificationApi.delete(id);
    if (result.success) {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.find((n) => n.id === id)?.read
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      }));
    }
  },
}));
