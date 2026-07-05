import { useState, useCallback } from 'react';
import ToastNotification from '../components/ui/ToastNotification';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 5000) => {
    setToast({ message, type, duration });
  }, []);

  const showSuccess = useCallback((message, duration = 5000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 5000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration = 5000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration = 5000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? (
    <ToastNotification
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={hideToast}
    />
  ) : null;

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastComponent,
  };
};

export default useToast;
