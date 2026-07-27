/**
 * Date Helper Utilities
 */

import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  subDays,
  addDays,
  parseISO,
  differenceInDays,
  startOfDay,
} from 'date-fns';

/** Format a date as YYYY-MM-DD */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Get today as YYYY-MM-DD */
export function todayString(): string {
  return toDateString(new Date());
}

/** Get a human-readable greeting based on time of day */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Format date for display: "Sunday, 27 July" */
export function formatDisplayDate(date: Date): string {
  return format(date, 'EEEE, d MMMM');
}

/** Get the start of the current week (Monday) */
export function getWeekStart(date: Date = new Date()): string {
  return toDateString(startOfWeek(date, { weekStartsOn: 1 }));
}

/** Get all days of the current week */
export function getWeekDays(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

/** Get the last N days as date strings */
export function getLastNDays(n: number, from: Date = new Date()): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(toDateString(subDays(from, i)));
  }
  return days;
}

/** Check if a date string is today */
export function isDateToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

/** Get day of week index (0=Sun, 1=Mon, ...) */
export function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay();
}

/** Format for short day display: "Mon", "Tue" */
export function formatShortDay(date: Date): string {
  return format(date, 'EEE');
}

/** Format for day number: "27" */
export function formatDayNumber(date: Date): string {
  return format(date, 'd');
}

export { isToday, isSameDay, subDays, addDays, parseISO, differenceInDays, startOfDay, format };
