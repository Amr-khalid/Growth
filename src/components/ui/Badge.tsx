/**
 * Badge Component — Category tag with pastel background for light theme
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import type { LifeCategory } from '../../types';

interface BadgeProps {
  category: LifeCategory;
  size?: 'sm' | 'md';
}

export function Badge({ category, size = 'sm' }: BadgeProps) {
  const config = CATEGORIES[category as keyof typeof CATEGORIES] || {
    key: category,
    label: category,
    emoji: '🎯',
    icon: 'bookmark',
    color: Colors.work,
    bgColor: Colors.workBg,
  };

  return (
    <View style={[
      styles.base,
      { backgroundColor: config.bgColor },
      size === 'md' && styles.md,
    ]}>
      <Text style={[
        styles.text,
        { color: config.color },
        size === 'md' && styles.mdText,
      ]}>
        {config.emoji} {config.label}
      </Text>
    </View>
  );
}

interface StreakBadgeProps {
  count: number;
  color?: string;
}

export function StreakBadge({ count, color = Colors.warning }: StreakBadgeProps) {
  if (count === 0) return null;

  return (
    <View style={[styles.streakBase, { backgroundColor: `${color}15` }]}>
      <Text style={[styles.streakText, { color }]}>
        🔥 {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    ...Typography.small,
    fontWeight: '700',
  },
  mdText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  streakBase: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    ...Typography.small,
    fontWeight: '800',
  },
});
 // Variant updates
