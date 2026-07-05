import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '../../app/store/userStore';
import { Modal, Button, Input } from '../../components/ui';
import useToast from '../../hooks/useToast.jsx';

const ChangePasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, isLoading } = useUserStore();
  const { showError, showWarning, ToastComponent } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showWarning('Passwords do not match.');
      return;
    }

    const result = await changePassword(user.id, data.newPassword);
    if (result.success) {
      reset();
      onSuccess?.();
      onClose();
    } else {
      showError(result.error || 'Failed to change password.');
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Change Password - ${user.name}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* User Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
        </div>

        {/* Password Fields */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              error={errors.newPassword?.message}
              {...register('newPassword', { 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === newPassword || 'Passwords do not match'
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

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Change Password
          </Button>
        </div>
      </form>
      {ToastComponent}
    </Modal>
  );
};

export default ChangePasswordModal;
