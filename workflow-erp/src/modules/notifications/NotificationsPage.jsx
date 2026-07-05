import React, { useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../app/store/notificationStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button } from '../../components/ui';
import { formatDistanceToNow } from '../../utils/helpers';

const NotificationsPage = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };

  const notificationIcons = {
    approval_request: '🔔',
    approval_approved: '✅',
    approval_rejected: '❌',
    task_assigned: '📋',
    workflow_created: '📝',
    document_uploaded: '📄',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            <Check size={18} className="mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You'll see notifications here when they arrive
              </p>
            </div>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow ${
              !notification.read ? 'border-l-4 border-l-navy-600' : ''
            }`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-2xl">
                  {notificationIcons[notification.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDistanceToNow(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Badge variant="info">New</Badge>
                      )}
                      <Link
                        to={notification.link}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
