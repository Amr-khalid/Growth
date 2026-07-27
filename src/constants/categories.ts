/**
 * Life Category Configuration
 * Each category has a unique accent color, icon, and label.
 */

import { Colors } from './theme';
import type { LifeCategory } from '../types';

export interface CategoryConfig {
  key: LifeCategory;
  label: string;
  emoji: string;
  icon: string; // Ionicons name
  color: string;
  bgColor: string;
}

export const CATEGORIES: Record<LifeCategory, CategoryConfig> = {
  work: {
    key: 'work',
    label: 'Work',
    emoji: '💼',
    icon: 'briefcase',
    color: Colors.work,
    bgColor: Colors.workBg,
  },
  health: {
    key: 'health',
    label: 'Health',
    emoji: '💪',
    icon: 'fitness',
    color: Colors.health,
    bgColor: Colors.healthBg,
  },
  relationships: {
    key: 'relationships',
    label: 'Relations',
    emoji: '❤️',
    icon: 'heart',
    color: Colors.relationships,
    bgColor: Colors.relationshipsBg,
  },
  finance: {
    key: 'finance',
    label: 'Finance',
    emoji: '💰',
    icon: 'wallet',
    color: Colors.finance,
    bgColor: Colors.financeBg,
  },
} as const;

export const CATEGORY_LIST: CategoryConfig[] = Object.values(CATEGORIES);

/**
 * Get category config dynamically with fallback
 */
export function getCategoryConfig(
  catId: string,
  dynamicCategories?: { id: string; label: string; emoji: string; color: string; icon?: string }[]
): CategoryConfig {
  if (CATEGORIES[catId as keyof typeof CATEGORIES]) {
    return CATEGORIES[catId as keyof typeof CATEGORIES];
  }

  if (dynamicCategories) {
    const found = dynamicCategories.find((c) => c.id === catId);
    if (found) {
      return {
        key: found.id as LifeCategory,
        label: found.label,
        emoji: found.emoji || '🎯',
        icon: found.icon || 'bookmark',
        color: found.color || Colors.work,
        bgColor: (found.color || Colors.work) + '20',
      };
    }
  }

  return {
    key: catId as LifeCategory,
    label: catId,
    emoji: '🎯',
    icon: 'bookmark',
    color: Colors.work,
    bgColor: Colors.workBg,
  };
}

/**
 * Get heatmap intensity colors for a specific category
 */
export function getHeatmapColors(category: LifeCategory, customColor?: string): string[] {
  const base = customColor || CATEGORIES[category as keyof typeof CATEGORIES]?.color || Colors.work;
  return [
    Colors.heatmapEmpty,
    `${base}33`, // 20% opacity
    `${base}66`, // 40% opacity
    `${base}99`, // 60% opacity
    base,        // 100%
  ];
}
