import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/authStore';
import { useNotificationStore } from '../../app/store/notificationStore';
import { formatDistanceToNow } from '../../utils/helpers';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user, fetchNotifications]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    navigate(notification.link);
  };

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search workflows, projects, documents..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-600"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center ml-4 space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          !notification.read ? 'bg-navy-50 dark:bg-navy-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatDistanceToNow(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-navy-700 rounded-full mt-1.5 ml-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
