// Notification data starts empty until users trigger events in the app.
export const mockNotifications = [];

export const notificationService = {
  getAll: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const notifications = mockNotifications.filter((n) => n.userId === userId);
    return { success: true, data: notifications };
  },

  getUnread: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const notifications = mockNotifications.filter(
      (n) => n.userId === userId && !n.read
    );
    return { success: true, data: notifications };
  },

  markAsRead: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      return { success: true, data: notif };
    }
    return { success: false, error: 'Notification not found' };
  },

  markAllAsRead: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockNotifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    return { success: true };
  },

  create: async (notification) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newNotif = {
      id: `NOTIF-${String(mockNotifications.length + 1).padStart(3, '0')}`,
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };
    mockNotifications.push(newNotif);
    return { success: true, data: newNotif };
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = mockNotifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return { success: false, error: 'Notification not found' };
    }
    mockNotifications.splice(index, 1);
    return { success: true };
  },
};
