import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { IncidentPriority, IncidentStatus, IncidentTrend, CivicCategory } from '../types';

// ─── cn utility ──────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Priority helpers ────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<
  IncidentPriority,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-800',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-600',
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  LOW: {
    label: 'Low',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
};

// ─── Status helpers ──────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  IncidentStatus,
  { label: string; color: string; bg: string }
> = {
  OPEN: { label: 'Open', color: 'text-blue-700', bg: 'bg-blue-50' },
  ASSIGNED: { label: 'Assigned', color: 'text-purple-700', bg: 'bg-purple-50' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-50' },
  RESOLVED: { label: 'Resolved', color: 'text-green-700', bg: 'bg-green-50' },
  REOPENED: { label: 'Reopened', color: 'text-orange-700', bg: 'bg-orange-50' },
  CLOSED: { label: 'Closed', color: 'text-gray-700', bg: 'bg-gray-100' },
};

// ─── Trend helpers ───────────────────────────────────────────────────

export const TREND_CONFIG: Record<
  IncidentTrend,
  { label: string; color: string; icon: string }
> = {
  STABLE: { label: 'Stable', color: 'text-green-600', icon: '→' },
  RISING: { label: 'Rising', color: 'text-amber-600', icon: '↑' },
  RAPIDLY_RISING: { label: 'Rapidly Escalating', color: 'text-red-600', icon: '⬆' },
};

// ─── Category helpers ────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<
  CivicCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  drainage: { label: 'Drainage', icon: 'Droplets', color: 'text-blue-600', bg: 'bg-blue-50' },
  garbage: { label: 'Garbage', icon: 'Trash2', color: 'text-green-600', bg: 'bg-green-50' },
  road_damage: { label: 'Road Damage', icon: 'Construction', color: 'text-orange-600', bg: 'bg-orange-50' },
  electrical_hazard: { label: 'Electrical', icon: 'Zap', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  other: { label: 'Other', icon: 'HelpCircle', color: 'text-purple-600', bg: 'bg-purple-50' },
};

// ─── Date/Time helpers ───────────────────────────────────────────────

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Number helpers ──────────────────────────────────────────────────

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// ─── Fusion confidence label ─────────────────────────────────────────

export function getFusionLabel(confidence: number): { label: string; color: string } {
  if (confidence >= 0.85) return { label: 'High Confidence', color: 'text-green-600' };
  if (confidence >= 0.65) return { label: 'Medium Confidence', color: 'text-amber-600' };
  return { label: 'Low Confidence', color: 'text-red-600' };
}
