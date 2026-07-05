import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Shield, UserCheck, User, Power, Edit, Key, Trash2, UserX } from 'lucide-react';
import { useUserStore } from '../../app/store/userStore';
import { useAuthStore } from '../../app/store/authStore';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { roles } from '../../services/mock/userMock';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import ChangePasswordModal from './ChangePasswordModal';
import useToast from '../../hooks/useToast.jsx';

const UsersPage = () => {
  const { users, fetchUsers, deleteUser, toggleUserStatus, isLoading } = useUserStore();
  const { user: currentUser } = useAuthStore();
  const canCreateUsers = currentUser?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [changingPassword, setChangingPassword] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const { showSuccess, showError, ToastComponent } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (confirmDelete) {
      const result = await deleteUser(confirmDelete);
      if (result.success) {
        showSuccess('User deleted successfully.');
        setConfirmDelete(null);
      } else {
        showError(result.error || 'Failed to delete user.');
      }
    }
  };

  const handleToggleStatus = async () => {
    if (confirmToggle) {
      const result = await toggleUserStatus(confirmToggle);
      if (result?.success === false) {
        showError(result.error || 'Failed to update user status.');
        return;
      }
      showSuccess('User status updated successfully.');
      setConfirmToggle(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => u.role === 'staff').length,
  };

  const roleIcons = {
    admin: Shield,
    manager: UserCheck,
    staff: User,
  };

  const roleColors = {
    admin: 'danger',
    manager: 'warning',
    staff: 'info',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage user accounts across departments</p>
        </div>
        {canCreateUsers && (
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus size={18} className="mr-2" />
            Create User
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.admins}</p>
        </Card>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(roles).map(([key, role]) => {
          const Icon = roleIcons[key];
          const userCount = stats[key + 's'] || 0;
          
          return (
            <Card key={key}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  key === 'admin' ? 'bg-red-100 dark:bg-red-900/30' :
                  key === 'manager' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <Icon
                    size={24}
                    className={
                      key === 'admin' ? 'text-red-600' :
                      key === 'manager' ? 'text-yellow-600' :
                      'text-blue-600'
                    }
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{role.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{userCount} user{userCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{role.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, username, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-600"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-600"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </Card>

      {/* User List */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  const isCurrentUser = currentUser?.id === user.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-navy-700 dark:text-navy-400">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <RoleIcon size={16} className="text-gray-500" />
                          <Badge variant={roleColors[user.role]}>
                            {roles[user.role].label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.lastLogin ? (
                          <div>
                            <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(user.lastLogin).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Status */}
                          <button
                            onClick={() => setConfirmToggle(user.id)}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title={user.isActive ? 'Disable User' : 'Enable User'}
                          >
                            {user.isActive ? <UserX size={16} /> : <Power size={16} className="text-green-600" />}
                          </button>
                          
                          {/* Edit */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          
                          {/* Change Password */}
                          <button
                            onClick={() => setChangingPassword(user)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                            title="Change Password"
                          >
                            <Key size={16} />
                          </button>
                          
                          {/* Delete (not for current user) */}
                          {!isCurrentUser && (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Confirmation Modals */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        title="Confirm Action"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {users.find(u => u.id === confirmToggle)?.isActive 
              ? 'Are you sure you want to disable this user? They will not be able to log in.'
              : 'Are you sure you want to enable this user?'}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmToggle(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleToggleStatus}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create User Modal */}
      {canCreateUsers && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchUsers()}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onSuccess={() => {
            fetchUsers();
            setEditingUser(null);
          }}
        />
      )}

      {/* Change Password Modal */}
      {changingPassword && (
        <ChangePasswordModal
          isOpen={!!changingPassword}
          onClose={() => setChangingPassword(null)}
          user={changingPassword}
          onSuccess={() => setChangingPassword(null)}
        />
      )}

      {ToastComponent}
    </div>
  );
};

export default UsersPage;
