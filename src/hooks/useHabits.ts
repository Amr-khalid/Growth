/**
 * useHabits Hook — CRUD operations and stat calculations for habits
 */

import { useState, useEffect, useCallback } from 'react';
import { getDatabase, generateId } from '../db/client';
import { todayString } from '../utils/dateHelpers';
import { calculateStreaks, isHabitDueToday } from '../utils/streakCalculator';
import type { Habit, HabitCompletion, HabitWithStats, LifeCategory, HabitFrequency } from '../types';

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    try {
      const db = await getDatabase();
      const today = todayString();

      // Get all active habits
      const habitsResult = await db.getAllAsync<Habit>(
        'SELECT * FROM habits WHERE isArchived = 0 ORDER BY createdAt DESC'
      );

      // Get all completions for these habits
      const habitsWithStats: HabitWithStats[] = await Promise.all(
        habitsResult.map(async (habit) => {
          const completions = await db.getAllAsync<HabitCompletion>(
            'SELECT * FROM habit_completions WHERE habitId = ? ORDER BY completedAt ASC',
            [habit.id]
          );

          const completionDates = completions.map((c) => c.completedAt);
          const { currentStreak, longestStreak } = calculateStreaks(completionDates);
          const isCompletedToday = completionDates.includes(today);

          return {
            ...habit,
            specificDays: habit.specificDays ? JSON.parse(habit.specificDays as unknown as string) : undefined,
            isArchived: Boolean(habit.isArchived),
            currentStreak,
            longestStreak,
            isCompletedToday,
            completions: completionDates,
          };
        })
      );

      setHabits(habitsWithStats);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const addHabit = useCallback(async (
    name: string,
    category: LifeCategory,
    frequency: HabitFrequency,
    specificDays?: number[]
  ) => {
    const db = await getDatabase();
    const id = generateId();
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO habits (id, name, category, frequency, specificDays, createdAt, isArchived) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [id, name, category, frequency, specificDays ? JSON.stringify(specificDays) : null, now]
    );

    await loadHabits();
    return id;
  }, [loadHabits]);

  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    const db = await getDatabase();
    const today = todayString();

    // Check if already completed today
    const existing = await db.getFirstAsync<HabitCompletion>(
      'SELECT * FROM habit_completions WHERE habitId = ? AND completedAt = ?',
      [habitId, today]
    );

    if (existing) {
      // Uncomplete
      await db.runAsync(
        'DELETE FROM habit_completions WHERE habitId = ? AND completedAt = ?',
        [habitId, today]
      );
    } else {
      // Complete
      const id = generateId();
      await db.runAsync(
        'INSERT INTO habit_completions (id, habitId, completedAt) VALUES (?, ?, ?)',
        [id, habitId, today]
      );
    }

    await loadHabits();
  }, [loadHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habits WHERE id = ?', [habitId]);
    await loadHabits();
  }, [loadHabits]);

  const archiveHabit = useCallback(async (habitId: string) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE habits SET isArchived = 1 WHERE id = ?', [habitId]);
    await loadHabits();
  }, [loadHabits]);

  // Computed values
  const todayHabits = habits.filter((h) =>
    isHabitDueToday(h.frequency, h.specificDays)
  );

  const completedToday = todayHabits.filter((h) => h.isCompletedToday).length;
  const totalToday = todayHabits.length;

  return {
    habits,
    todayHabits,
    completedToday,
    totalToday,
    loading,
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
    archiveHabit,
    refresh: loadHabits,
  };
}
 // State cache optimization
