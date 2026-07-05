// Helper utility functions

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatDistanceToNow(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Format a date to readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time (e.g., "Jan 15, 2024 10:30 AM")
 */
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
  const statusMap = {
    pending: 'warning',
    pending_approval: 'warning',
    in_progress: 'info',
    completed: 'success',
    approved: 'success',
    rejected: 'danger',
    active: 'success',
    planning: 'neutral',
    cancelled: 'danger',
  };
  return statusMap[status] || 'neutral';
}

/**
 * Get status label (human-readable)
 */
export function getStatusLabel(status) {
  const labelMap = {
    pending: 'Pending',
    pending_approval: 'Pending Approval',
    in_progress: 'In Progress',
    completed: 'Completed',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    planning: 'Planning',
    cancelled: 'Cancelled',
  };
  return labelMap[status] || status;
}

/**
 * Calculate workflow progress percentage
 */
export function calculateWorkflowProgress(steps) {
  if (!steps || steps.length === 0) return 0;
  const completedSteps = steps.filter((step) => step.status === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
