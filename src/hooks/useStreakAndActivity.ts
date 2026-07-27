/**
 * useStreakAndActivity Hook
 * Aggregates all habit completions & completed tasks to compute overall daily activity,
 * calculate streak with 3-day grace period, and provide activity details per calendar date.
 */

import { useState, useEffect, useCallback } from 'react';
import { getDatabase } from '../db/client';
import { todayString } from '../utils/dateHelpers';
import { calculateStreakWithGrace, StreakGraceResult } from '../utils/streakCalculator';

export interface DayActivityDetail {
  date: string;
  habitsCompleted: { id: string; name: string; category: string }[];
  tasksCompleted: { id: string; title: string; category: string }[];
}

export function useStreakAndActivity() {
  const [loading, setLoading] = useState(true);
  const [streakStats, setStreakStats] = useState<StreakGraceResult>({
    currentStreak: 0,
    longestStreak: 0,
    graceDaysRemaining: 3,
    isGraceActive: false,
    daysSinceLastActivity: 0,
    activeDatesSet: new Set(),
    graceDatesSet: new Set(),
  });
  const [dailyDetailsMap, setDailyDetailsMap] = useState<Map<string, DayActivityDetail>>(new Map());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();

      // 1. Fetch all habit completions joined with habit info
      const habitCompletions = await db.getAllAsync<{
        id: string;
        habitId: string;
        completedAt: string;
        name: string;
        category: string;
      }>(`
        SELECT hc.id, hc.habitId, hc.completedAt, h.name, h.category
        FROM habit_completions hc
        JOIN habits h ON hc.habitId = h.id
      `);

      // 2. Fetch completed tasks with completion date
      const completedTasks = await db.getAllAsync<{
        id: string;
        title: string;
        category: string;
        completedAt: string;
        dueDate: string;
      }>(`
        SELECT id, title, category, completedAt, dueDate
        FROM tasks
        WHERE isCompleted = 1
      `);

      // 3. Aggregate completions into daily activity details map
      const detailsMap = new Map<string, DayActivityDetail>();

      habitCompletions.forEach((hc) => {
        const dateStr = hc.completedAt;
        if (!detailsMap.has(dateStr)) {
          detailsMap.set(dateStr, { date: dateStr, habitsCompleted: [], tasksCompleted: [] });
        }
        detailsMap.get(dateStr)!.habitsCompleted.push({
          id: hc.habitId,
          name: hc.name,
          category: hc.category,
        });
      });

      completedTasks.forEach((task) => {
        // Use completedAt date if available, fallback to dueDate
        const dateStr = task.completedAt
          ? task.completedAt.split('T')[0]
          : task.dueDate;
        if (!dateStr) return;

        if (!detailsMap.has(dateStr)) {
          detailsMap.set(dateStr, { date: dateStr, habitsCompleted: [], tasksCompleted: [] });
        }
        detailsMap.get(dateStr)!.tasksCompleted.push({
          id: task.id,
          title: task.title,
          category: task.category,
        });
      });

      // 4. Extract sorted unique active dates
      const activeDates = Array.from(detailsMap.keys()).sort();

      // 5. Calculate streak with 3-day grace period
      const stats = calculateStreakWithGrace(activeDates, 3, todayString());

      setDailyDetailsMap(detailsMap);
      setStreakStats(stats);
    } catch (error) {
      console.error('Error loading streak and activity data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDayDetails = useCallback(
    (dateStr: string): DayActivityDetail => {
      return (
        dailyDetailsMap.get(dateStr) || {
          date: dateStr,
          habitsCompleted: [],
          tasksCompleted: [],
        }
      );
    },
    [dailyDetailsMap]
  );

  return {
    loading,
    streakStats,
    getDayDetails,
    refresh: loadData,
  };
}
