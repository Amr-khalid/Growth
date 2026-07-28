/**
 * Streak Calculator
 * Calculates current and longest streaks for habits.
 */

import { parseISO, differenceInDays, subDays, format } from 'date-fns';
import { todayString, toDateString } from './dateHelpers';

/**
 * Calculate the current streak (consecutive days completed, ending today or yesterday)
 * and the longest streak ever for a habit.
 */
export function calculateStreaks(completionDates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (completionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort dates in ascending order and deduplicate
  const sortedDates = [...new Set(completionDates)].sort();

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1]);
    const curr = parseISO(sortedDates[i]);
    const diff = differenceInDays(curr, prev);

    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (diff > 1) {
      tempStreak = 1;
    }
    // diff === 0 means same day (duplicate), skip
  }

  // Calculate current streak (must include today or yesterday)
  const today = todayString();
  const yesterday = toDateString(subDays(new Date(), 1));
  const lastCompletion = sortedDates[sortedDates.length - 1];

  if (lastCompletion !== today && lastCompletion !== yesterday) {
    // Streak is broken
    return { currentStreak: 0, longestStreak };
  }

  // Walk backwards from the last completion
  let currentStreak = 1;
  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const curr = parseISO(sortedDates[i + 1]);
    const prev = parseISO(sortedDates[i]);
    const diff = differenceInDays(curr, prev);

    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

/**
 * Check if a habit should be done today based on its frequency
 */
export function isHabitDueToday(
  frequency: 'daily' | 'weekly' | 'specific_days',
  specificDays?: number[]
): boolean {
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ...

  switch (frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return today === 1; // Monday
    case 'specific_days':
      return specificDays?.includes(today) ?? false;
    default:
      return true;
  }
}

/**
 * Interface for Streak result with Grace Period
 */
export interface StreakGraceResult {
  currentStreak: number;
  longestStreak: number;
  graceDaysRemaining: number;
  isGraceActive: boolean;
  daysSinceLastActivity: number;
  activeDatesSet: Set<string>;
  graceDatesSet: Set<string>;
}

/**
 * Calculate streak with 3-day grace period tolerance.
 * Up to 3 consecutive missed days are covered by grace shields (🛡️).
 * Exceeding 3 missed days resets current streak to 0.
 */
export function calculateStreakWithGrace(
  activeDates: string[],
  maxGraceDays = 3,
  referenceDateStr?: string
): StreakGraceResult {
  const today = referenceDateStr || todayString();
  const activeDatesSet = new Set<string>(activeDates);
  const graceDatesSet = new Set<string>();

  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      graceDaysRemaining: maxGraceDays,
      isGraceActive: false,
      daysSinceLastActivity: 999,
      activeDatesSet,
      graceDatesSet,
    };
  }

  // Sort unique active dates ascending
  const sortedDates = [...new Set(activeDates)].sort();

  // Populate grace dates for historical gaps <= maxGraceDays
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1]);
    const curr = parseISO(sortedDates[i]);
    const gapDays = differenceInDays(curr, prev) - 1;

    if (gapDays > 0 && gapDays <= maxGraceDays) {
      for (let g = 1; g <= gapDays; g++) {
        graceDatesSet.add(toDateString(subDays(curr, gapDays - g + 1)));
      }
    }
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  let chainStart = parseISO(sortedDates[0]);
  let chainEnd = parseISO(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1]);
    const curr = parseISO(sortedDates[i]);
    const gapDays = differenceInDays(curr, prev) - 1;

    if (gapDays <= maxGraceDays) {
      // Chain continues across active + grace days
      chainEnd = curr;
    } else {
      // Chain broken, compute length of previous chain
      const chainLen = differenceInDays(chainEnd, chainStart) + 1;
      longestStreak = Math.max(longestStreak, chainLen);
      chainStart = curr;
      chainEnd = curr;
    }
  }
  const lastChainLen = differenceInDays(chainEnd, chainStart) + 1;
  longestStreak = Math.max(longestStreak, lastChainLen);

  // Calculate current streak relative to today
  const lastActiveStr = sortedDates[sortedDates.length - 1];
  const lastActiveDate = parseISO(lastActiveStr);
  const todayDate = parseISO(today);
  const daysSinceLastActivity = Math.max(0, differenceInDays(todayDate, lastActiveDate));

  let currentStreak = 0;
  let graceDaysRemaining = maxGraceDays;
  let isGraceActive = false;

  if (daysSinceLastActivity === 0) {
    // Active today!
    graceDaysRemaining = maxGraceDays;
    isGraceActive = false;

    // Find current chain length leading up to today
    let currentChainStart = lastActiveDate;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const curr = parseISO(sortedDates[i + 1]);
      const prev = parseISO(sortedDates[i]);
      const gapDays = differenceInDays(curr, prev) - 1;

      if (gapDays <= maxGraceDays) {
        currentChainStart = prev;
      } else {
        break;
      }
    }
    currentStreak = differenceInDays(todayDate, currentChainStart) + 1;
  } else if (daysSinceLastActivity <= maxGraceDays) {
    // Within grace period (1, 2, or 3 missed days)
    isGraceActive = true;
    graceDaysRemaining = Math.max(0, maxGraceDays - daysSinceLastActivity);

    // Add recent missed days to graceDatesSet for display
    for (let g = 1; g <= daysSinceLastActivity; g++) {
      graceDatesSet.add(toDateString(subDays(todayDate, daysSinceLastActivity - g)));
    }

    // Current chain length includes last active chain + recent grace days
    let currentChainStart = lastActiveDate;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const curr = parseISO(sortedDates[i + 1]);
      const prev = parseISO(sortedDates[i]);
      const gapDays = differenceInDays(curr, prev) - 1;

      if (gapDays <= maxGraceDays) {
        currentChainStart = prev;
      } else {
        break;
      }
    }

    // End date of current chain is yesterday (last full grace day) or today
    const currentChainEnd = subDays(todayDate, 1);
    currentStreak = Math.max(1, differenceInDays(currentChainEnd, currentChainStart) + 1);
  } else {
    // Missed > maxGraceDays: Streak is reset to 0!
    currentStreak = 0;
    graceDaysRemaining = 0;
    isGraceActive = false;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    graceDaysRemaining,
    isGraceActive,
    daysSinceLastActivity,
    activeDatesSet,
    graceDatesSet,
  };
}

/**
 * Get completion count for a specific date range (for heatmap)
 */
export function getCompletionMap(
  completionDates: string[],
  days: string[]
): Map<string, boolean> {
  const dateSet = new Set(completionDates);
  const map = new Map<string, boolean>();
  for (const day of days) {
    map.set(day, dateSet.has(day));
  }
  return map;
}

