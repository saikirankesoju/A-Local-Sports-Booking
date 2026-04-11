import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string) {
  const [hoursPart, minutesPart = '00'] = time.split(':');
  const hours = Number.parseInt(hoursPart, 10);

  if (Number.isNaN(hours)) {
    return time;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;

  return `${normalizedHours}:${minutesPart.padStart(2, '0')} ${period}`;
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function isOwnedByUser(ownerId: string, user?: Pick<User, 'id' | 'email'> | null) {
  if (!user) {
    return false;
  }

  return ownerId === user.id || ownerId === user.email;
}
