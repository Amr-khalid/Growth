/**
 * useCategories Hook — Dynamic Category CRUD & Default Seeding
 */

import { useState, useEffect, useCallback } from 'react';
import { getDatabase, generateId } from '../db/client';
import { Colors } from '../constants/theme';
import type { CustomCategory } from '../types';

const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'work', label: 'Work', emoji: '💼', icon: 'briefcase', color: Colors.work, isDefault: true },
  { id: 'health', label: 'Health', emoji: '💪', icon: 'fitness', color: Colors.health, isDefault: true },
  { id: 'relationships', label: 'Relations', emoji: '❤️', icon: 'heart', color: Colors.relationships, isDefault: true },
  { id: 'finance', label: 'Finance', emoji: '💰', icon: 'wallet', color: Colors.finance, isDefault: true },
];

export function useCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getDatabase();

      let dbCategories = await db.getAllAsync<CustomCategory>(
        'SELECT id, label, emoji, icon, color, isDefault FROM categories ORDER BY isDefault DESC, label ASC'
      );

      if (!dbCategories || dbCategories.length === 0) {
        // Seed default categories
        for (const cat of DEFAULT_CATEGORIES) {
          await db.runAsync(
            'INSERT INTO categories (id, label, emoji, icon, color, isDefault) VALUES (?, ?, ?, ?, ?, ?)',
            [cat.id, cat.label, cat.emoji, cat.icon, cat.color, 1]
          );
        }
        dbCategories = DEFAULT_CATEGORIES;
      } else {
        dbCategories = dbCategories.map((c) => ({
          ...c,
          isDefault: Boolean(c.isDefault),
        }));
      }

      setCategories(dbCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to default
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(
    async (label: string, emoji: string, color: string) => {
      const db = await getDatabase();
      const id = 'cat_' + generateId();
      const catEmoji = emoji || '🎯';
      const catIcon = 'bookmark';

      await db.runAsync(
        'INSERT INTO categories (id, label, emoji, icon, color, isDefault) VALUES (?, ?, ?, ?, ?, 0)',
        [id, label, catEmoji, catIcon, color]
      );

      await loadCategories();
      return id;
    },
    [loadCategories]
  );

  const updateCategory = useCallback(
    async (id: string, label: string, emoji: string, color: string) => {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE categories SET label = ?, emoji = ?, color = ? WHERE id = ?',
        [label, emoji, color, id]
      );
      await loadCategories();
    },
    [loadCategories]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
      await loadCategories();
    },
    [loadCategories]
  );

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
}
 // Default category fallback
