/**
 * LifeOverview Component — 4 progress rings inside a clean white card for light theme
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { getCategoryConfig } from '../../constants/categories';
import { useCategories } from '../../hooks/useCategories';
import { ProgressRing } from '../ui/ProgressRing';
import { Card } from '../ui/Card';
import type { LifeCategory } from '../../types';

interface CategoryData {
  category: LifeCategory;
  percentage: number;
}

interface LifeOverviewProps {
  data: CategoryData[];
}

export function LifeOverview({ data }: LifeOverviewProps) {
  const { categories } = useCategories();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Life Overview ✨</Text>
      <Card style={styles.card}>
        <View style={styles.grid}>
          {categories.map((cat, index) => {
            const catData = data.find((d) => d.category === cat.id);
            const percentage = catData?.percentage ?? 0;
            const config = getCategoryConfig(cat.id, categories);

            return (
              <Animated.View
                key={cat.id}
                entering={FadeInUp.delay(index * 100).springify()}
                style={styles.item}
              >
                <ProgressRing
                  progress={percentage}
                  size={72}
                  strokeWidth={6}
                  color={config.color}
                  showLabel={true}
                />
                <Text style={[styles.label, { color: config.color }]} numberOfLines={1}>
                  {config.emoji} {config.label}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    paddingVertical: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: Spacing.md,
  },
  item: {
    alignItems: 'center',
    width: '21%',
    minWidth: 72,
  },
  label: {
    ...Typography.small,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
});
 // Score breakdown calculation
