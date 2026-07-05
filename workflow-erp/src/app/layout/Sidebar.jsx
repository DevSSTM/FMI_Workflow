import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  CheckSquare,
  FileText,
  FolderKanban,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuthStore } from '../../app/store/authStore';

const Sidebar = ({ collapsed, setCollapsed, onToggleDark, isDark }) => {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'all' },
    { path: '/workflows', icon: Workflow, label: 'Workflows', permission: 'all' },
    { path: '/approvals', icon: CheckSquare, label: 'Approvals', permission: 'approve' },
    { path: '/documents', icon: FileText, label: 'Documents', permission: 'all' },
    { path: '/projects', icon: FolderKanban, label: 'Projects', permission: 'all' },
    { path: '/users', icon: Users, label: 'Users', permission: 'manage_users' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
                <Workflow size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Workflow ERP</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? (
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems
              .filter((item) => hasPermission(item.permission))
              .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-navy-50 dark:bg-navy-900/30 text-navy-700 dark:text-navy-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!collapsed && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span className="ml-3 font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* User Info */}
          {user && (
            <div className={`flex items-center px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
