import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '0';
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(parsed)) return '0';
  return new Intl.NumberFormat().format(parsed);
}

export function truncate(str: string | null | undefined, len = 8): string {
  if (!str) return '';
  if (str.length <= len) return str;
  return `${str.substring(0, len)}...`;
}
