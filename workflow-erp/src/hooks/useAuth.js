import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store/authStore';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}

/**
 * Hook to check permissions
 */
export function usePermissions() {
  const { user, hasPermission } = useAuthStore();

  return {
    user,
    role: user?.role || null,
    hasPermission,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'staff',
  };
}

/**
 * Hook for notification polling simulation
 */
export function useNotificationSimulation() {
  const { addNotification } = require('../app/store/notificationStore');
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Simulate periodic notifications
    const interval = setInterval(() => {
      const randomChance = Math.random();
      if (randomChance > 0.7) {
        // 30% chance every 30 seconds
        addNotification({
          type: 'task_assigned',
          title: 'New Task',
          message: 'You have been assigned to a new workflow step',
          userId: user.id,
          link: '/workflows',
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, addNotification]);
}
