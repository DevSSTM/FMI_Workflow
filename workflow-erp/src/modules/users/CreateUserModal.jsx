import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '../../app/store/userStore';
import { Modal, Button, Input, Select } from '../../components/ui';
import { roles, departments } from '../../services/mock/userMock';
import useToast from '../../hooks/useToast.jsx';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { createUser, isLoading } = useUserStore();
  const { showSuccess, showError, showWarning, ToastComponent } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      phone: '',
    },
  });

  const password = watch('password');

  const roleOptions = Object.entries(roles).map(([value, role]) => ({
    value,
    label: role.label,
  }));

  const departmentOptions = departments.map((dept) => ({
    value: dept,
    label: dept,
  }));

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      showWarning('Passwords do not match.');
      return;
    }

    const userData = {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
      department: data.department,
      phone: data.phone,
    };

    const result = await createUser(userData);
    if (result.success) {
      showSuccess(`User "${data.name}" created successfully.`);
      reset();
      onSuccess?.();
      onClose();
    } else {
      showError(result.error || 'Failed to create user.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Personal Information
          </h3>
          
          <Input
            label="Full Name"
            placeholder="Enter full name"
            error={errors.name?.message}
            {...register('name', { required: 'Full name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              placeholder="Choose username"
              error={errors.username?.message}
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
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
          </div>

          <Input
            label="Phone Number"
            placeholder="+1-555-0100"
            {...register('phone')}
          />
        </div>

        {/* Role & Department */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Role & Department
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              placeholder="Select role"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role', { required: 'Role is required' })}
            />
            <Select
              label="Department"
              placeholder="Select department"
              options={departmentOptions}
              error={errors.department?.message}
              {...register('department', { required: 'Department is required' })}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Security
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                error={errors.password?.message}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create User
          </Button>
        </div>
      </form>
      {ToastComponent}
    </Modal>
  );
};

export default CreateUserModal;
