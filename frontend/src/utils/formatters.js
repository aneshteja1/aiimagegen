import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCredits = (n) => {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString();
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatProgress = (progress) => `${Math.round(progress)}%`;

export const truncate = (str, len = 40) => {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}…` : str;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
};
