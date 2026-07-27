/**
 * Analytics Screen — Performance stats & category progress (Light Theme)
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { CATEGORIES } from '../../src/constants/categories';
import { useHabits } from '../../src/hooks/useHabits';
import { useTasks } from '../../src/hooks/useTasks';
import { useCategories } from '../../src/hooks/useCategories';
import { CategoryManagerModal } from '../../src/components/categories/CategoryManagerModal';
import { Card } from '../../src/components/ui/Card';
import { ProgressRing } from '../../src/components/ui/ProgressRing';

export default function AnalyticsScreen() {
  const { habits, todayHabits, completedToday: habitsCompleted, totalToday: habitsTotal, refresh: refreshHabits } = useHabits();
  const { todayTasks, completedToday: tasksCompleted, totalToday: tasksTotal, refresh: refreshTasks } = useTasks();
  const { categories, refresh: refreshCategories } = useCategories();

  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshHabits(), refreshTasks(), refreshCategories()]);
    setRefreshing(false);
  };

  const totalItems = tasksTotal + habitsTotal;
  const totalCompleted = tasksCompleted + habitsCompleted;
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const categoryData = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = todayTasks.filter((t) => t.category === cat.id);
      const catHabits = todayHabits.filter((h) => h.category === cat.id);

      const total = catTasks.length + catHabits.length;
      const completed =
        catTasks.filter((t) => t.isCompleted).length +
        catHabits.filter((h) => h.isCompletedToday).length;

      return {
        id: cat.id,
        label: cat.label,
        emoji: cat.emoji,
        color: cat.color,
        bgColor: cat.color + '18',
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [categories, todayTasks, todayHabits]);

  const topStreaks = useMemo(() => {
    return [...habits]
      .filter((h) => h.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5);
  }, [habits]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.work}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={styles.title}>Analytics 📊</Text>
          <Text style={styles.subtitle}>Daily progress & habit streak stats</Text>
        </Animated.View>

        {/* Overall Progress Card */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Card style={styles.overallCard}>
            <View style={styles.overallRow}>
              <ProgressRing
                progress={overallProgress}
                size={100}
                strokeWidth={8}
                color={Colors.work}
              />
              <View style={styles.overallStats}>
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>{tasksCompleted}/{tasksTotal}</Text>
                  <Text style={styles.overallStatLabel}>Tasks Done</Text>
                </View>
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>{habitsCompleted}/{habitsTotal}</Text>
                  <Text style={styles.overallStatLabel}>Habits Done</Text>
                </View>
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>{habits.length}</Text>
                  <Text style={styles.overallStatLabel}>Active Habits</Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <Pressable style={styles.manageCatBtn} onPress={() => setShowCategoryManager(true)}>
              <Ionicons name="settings-outline" size={14} color={Colors.work} />
              <Text style={styles.manageCatText}>إدارة التصنيفات</Text>
            </Pressable>
          </View>

          {categoryData.map((cat, index) => (
            <Animated.View
              key={cat.id}
              entering={FadeInDown.delay(200 + index * 80).springify()}
            >
              <View style={[styles.categoryRow, Shadows.card]}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.bgColor }]}>
                  <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.label}</Text>
                    <Text style={[styles.categoryPercent, { color: cat.color }]}>
                      {cat.percentage}%
                    </Text>
                  </View>
                  {/* Progress Bar */}
                  <View style={styles.barBg}>
                    <Animated.View
                      style={[
                        styles.barFill,
                        {
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryDetail}>
                    {cat.completed}/{cat.total} items completed
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Category Manager Modal */}
        <CategoryManagerModal
          visible={showCategoryManager}
          onClose={() => {
            setShowCategoryManager(false);
            refreshCategories();
          }}
        />

        {/* Streak Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Streak Leaderboard</Text>
          {topStreaks.length === 0 ? (
            <Card style={styles.emptyStreaks}>
              <Text style={styles.emptyText}>
                Complete daily habits to start building streak records!
              </Text>
            </Card>
          ) : (
            topStreaks.map((habit, index) => {
              const catConfig = categories.find((c) => c.id === habit.category) ||
                (CATEGORIES as any)[habit.category] || {
                  label: habit.category,
                  emoji: '🎯',
                  color: Colors.work,
                };
              return (
                <Animated.View
                  key={habit.id}
                  entering={FadeInDown.delay(400 + index * 60).springify()}
                >
                  <Card style={styles.streakCard}>
                    <View style={styles.streakRow}>
                      <Text style={styles.streakRank}>#{index + 1}</Text>
                      <View style={styles.streakInfo}>
                        <Text style={styles.streakName}>{habit.name}</Text>
                        <Text style={[styles.streakCategory, { color: catConfig.color }]}>
                          {catConfig.emoji} {catConfig.label}
                        </Text>
                      </View>
                      <View style={styles.streakBadge}>
                        <Text style={styles.streakFire}>🔥</Text>
                        <Text style={[styles.streakCount, { color: catConfig.color }]}>
                          {habit.currentStreak}
                        </Text>
                        <Text style={styles.streakDays}>days</Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Typography.display,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overallCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  overallStats: {
    flex: 1,
    gap: Spacing.md,
  },
  overallStatItem: {},
  overallStatValue: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  overallStatLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  manageCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.workBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  manageCatText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.work,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  categoryPercent: {
    ...Typography.body,
    fontWeight: '800',
  },
  barBg: {
    height: 6,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryDetail: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  streakCard: {
    marginBottom: Spacing.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakRank: {
    ...Typography.heading,
    color: Colors.textMuted,
    width: 36,
    fontWeight: '800',
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  streakCategory: {
    ...Typography.small,
    marginTop: 2,
    fontWeight: '700',
  },
  streakBadge: {
    alignItems: 'center',
  },
  streakFire: {
    fontSize: 20,
  },
  streakCount: {
    ...Typography.heading,
    fontWeight: '800',
  },
  streakDays: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  emptyStreaks: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
