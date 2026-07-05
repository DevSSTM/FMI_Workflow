import React from 'react';

const Card = ({ children, className = '', header, footer, onClick }) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {header && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          {header}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
