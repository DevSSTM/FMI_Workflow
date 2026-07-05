import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    info: 'badge badge-info',
    neutral: 'badge badge-neutral',
  };

  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
