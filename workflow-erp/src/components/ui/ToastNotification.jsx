import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastNotification = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200',
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <div
      className={`fixed top-6 right-6 z-50 max-w-md transform transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${colorScheme.icon}`}>
            <Icon size={20} />
          </div>
          <div className={`flex-1 text-sm font-medium ${colorScheme.text}`}>
            {message}
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${colorScheme.icon} hover:opacity-70 transition-opacity`}
          >
            <X size={18} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-0.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorScheme.icon.replace('text-', 'bg-')} animate-shrink`}
            style={{
              animationDuration: `${duration}ms`,
              animationTimingFunction: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
