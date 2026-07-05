import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUserStore } from '../../app/store/userStore';
import { Modal, Button, Input, Select } from '../../components/ui';
import { roles, departments } from '../../services/mock/userMock';
import useToast from '../../hooks/useToast.jsx';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const { updateUser, isLoading } = useUserStore();
  const { showError, ToastComponent } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || '',
      department: user?.department || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        department: user.department || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const roleOptions = Object.entries(roles).map(([value, role]) => ({
    value,
    label: role.label,
  }));

  const departmentOptions = departments.map((dept) => ({
    value: dept,
    label: dept,
  }));

  const onSubmit = async (data) => {
    const result = await updateUser(user.id, data);
    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      showError(result.error || 'Failed to update user.');
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* User Info (Read-only) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
            {user.lastLogin && <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            error={errors.name?.message}
            {...register('name', { required: 'Full name is required' })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="user@company.com"
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
            })}
          />

          <Input
            label="Phone Number"
            placeholder="+1-555-0100"
            {...register('phone')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role', { required: 'Role is required' })}
            />
            <Select
              label="Department"
              options={departmentOptions}
              error={errors.department?.message}
              {...register('department', { required: 'Department is required' })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Update User
          </Button>
        </div>
      </form>
      {ToastComponent}
    </Modal>
  );
};

export default EditUserModal;
