/**
 * Utility functions for formatting addresses, timestamps, etc.
 */

export function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatTimestamp(timestamp) {
  // Check if timestamp is already in milliseconds or needs conversion
  const timestampMs = timestamp > 1e12 ? timestamp : Number(timestamp) * 1000;
  const date = new Date(timestampMs);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // Show full date with time for older notifications
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatNotificationTime(timestamp) {
  // Check if timestamp is already in milliseconds or needs conversion
  const timestampMs = timestamp > 1e12 ? timestamp : Number(timestamp) * 1000;
  const date = new Date(timestampMs);
  const now = new Date();

  // Format time (hour and minute)
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });

  // Check if it's today
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    // Show only time for today's notifications
    return timeStr;
  }
  
  // Show full date with time for older notifications
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
  
  return `${dateStr} at ${timeStr}`;
}

export function truncateText(text, maxLength = 280) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
