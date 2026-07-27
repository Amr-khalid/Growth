/**
 * useTasks Hook — CRUD operations for tasks and daily missions
 */

import { useState, useEffect, useCallback } from 'react';
import { getDatabase, generateId } from '../db/client';
import { todayString } from '../utils/dateHelpers';
import type { Task, LifeCategory } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const db = await getDatabase();
      const results = await db.getAllAsync<Task>(
        'SELECT * FROM tasks ORDER BY isCompleted ASC, dueDate ASC, createdAt DESC'
      );

      setTasks(results.map((t) => ({
        ...t,
        isDailyMission: Boolean(t.isDailyMission),
        isCompleted: Boolean(t.isCompleted),
        requireProof: Boolean(t.requireProof),
      })));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (
    title: string,
    category: LifeCategory,
    isDailyMission: boolean = false,
    dueDate?: string,
    options?: {
      requireProof?: boolean;
      proofImageUri?: string;
      proofAudioUri?: string;
      proofFileUri?: string;
    }
  ) => {
    const db = await getDatabase();
    const id = generateId();
    const now = new Date().toISOString();
    const date = dueDate || todayString();

    await db.runAsync(
      `INSERT INTO tasks (
        id, title, category, isDailyMission, isCompleted, dueDate, createdAt,
        requireProof, proofImageUri, proofAudioUri, proofFileUri
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        category,
        isDailyMission ? 1 : 0,
        0,
        date,
        now,
        options?.requireProof ? 1 : 0,
        options?.proofImageUri || null,
        options?.proofAudioUri || null,
        options?.proofFileUri || null,
      ]
    );

    await loadTasks();
    return id;
  }, [loadTasks]);

  const toggleTask = useCallback(async (taskId: string) => {
    const db = await getDatabase();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = new Date().toISOString();

    if (task.isCompleted) {
      await db.runAsync(
        'UPDATE tasks SET isCompleted = 0, completedAt = NULL WHERE id = ?',
        [taskId]
      );
    } else {
      await db.runAsync(
        'UPDATE tasks SET isCompleted = 1, completedAt = ? WHERE id = ?',
        [now, taskId]
      );
    }

    await loadTasks();
  }, [tasks, loadTasks]);

  const submitTaskProof = useCallback(
    async (
      taskId: string,
      proof: {
        imageUri?: string;
        audioUri?: string;
        fileUri?: string;
        note?: string;
      }
    ) => {
      const db = await getDatabase();
      const now = new Date().toISOString();
      await db.runAsync(
        `UPDATE tasks SET isCompleted = 1, completedAt = ?, proofImageUri = ?, proofAudioUri = ?, proofFileUri = ?, proofNote = ? WHERE id = ?`,
        [
          now,
          proof.imageUri || null,
          proof.audioUri || null,
          proof.fileUri || null,
          proof.note || null,
          taskId,
        ]
      );
      await loadTasks();
    },
    [loadTasks]
  );

  const deleteTask = useCallback(async (taskId: string) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [taskId]);
    await loadTasks();
  }, [loadTasks]);

  // Computed values
  const today = todayString();

  const dailyMissions = tasks.filter(
    (t) => t.isDailyMission && t.dueDate === today
  );

  const todayTasks = tasks.filter((t) => t.dueDate === today);

  const completedToday = todayTasks.filter((t) => t.isCompleted).length;
  const totalToday = todayTasks.length;

  const tasksByCategory = (category: LifeCategory) =>
    tasks.filter((t) => t.category === category && t.dueDate === today);

  return {
    tasks,
    dailyMissions,
    todayTasks,
    completedToday,
    totalToday,
    loading,
    addTask,
    toggleTask,
    submitTaskProof,
    deleteTask,
    tasksByCategory,
    refresh: loadTasks,
  };
}
