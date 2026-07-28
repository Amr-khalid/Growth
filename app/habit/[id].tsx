/**
 * Habit Detail Screen — Streak stats + Heatmap visualization (Light Theme)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { CATEGORIES } from '../../src/constants/categories';
import { useHabits } from '../../src/hooks/useHabits';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { HeatmapGrid } from '../../src/components/habits/HeatmapGrid';
import { useAlert } from '../../src/context/CustomAlertContext';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, toggleHabitCompletion, deleteHabit } = useHabits();
  const { showConfirm } = useAlert();

  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Habit not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const catConfig = CATEGORIES[habit.category as keyof typeof CATEGORIES] || {
    key: habit.category,
    label: habit.category,
    emoji: '🎯',
    icon: 'bookmark',
    color: Colors.work,
    bgColor: Colors.workBg,
  };

  const last30Completions = habit.completions.filter((d) => {
    const date = new Date(d);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });
  const completionRate = Math.round((last30Completions.length / 30) * 100);

  const handleDelete = () => {
    showConfirm({
      title: 'حذف العادة',
      message: `هل أنت تأكد من رغبتك في حذف العادة "${habit.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      type: 'error',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        await deleteHabit(habit.id);
        router.back();
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{habit.name}</Text>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Stats */}
        <Animated.View entering={FadeInDown.springify()}>
          <Card style={[styles.heroCard, Shadows.glow(catConfig.color)] as any}>
            <View style={styles.heroRow}>
              <ProgressRing
                progress={completionRate}
                size={90}
                strokeWidth={7}
                color={catConfig.color}
              />
              <View style={styles.heroStats}>
                <View style={styles.heroStatRow}>
                  <Text style={styles.heroStatValue}>{habit.currentStreak}</Text>
                  <Text style={styles.heroStatLabel}>Current Streak 🔥</Text>
                </View>
                <View style={styles.heroStatRow}>
                  <Text style={styles.heroStatValue}>{habit.longestStreak}</Text>
                  <Text style={styles.heroStatLabel}>Best Streak 🏆</Text>
                </View>
                <View style={styles.heroStatRow}>
                  <Text style={styles.heroStatValue}>{habit.completions.length}</Text>
                  <Text style={styles.heroStatLabel}>Total Completions</Text>
                </View>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Badge category={habit.category} size="md" />
              <Text style={styles.frequency}>
                {habit.frequency === 'daily'
                  ? 'Every day'
                  : habit.frequency === 'weekly'
                  ? 'Weekly'
                  : `${habit.specificDays?.length || 0} days/week`}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Heatmap */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Card style={styles.heatmapCard}>
            <Text style={styles.sectionTitle}>Activity Heatmap 🟩</Text>
            <Text style={styles.sectionSubtitle}>Last 91 days of commitment</Text>
            <HeatmapGrid
              completionDates={habit.completions}
              category={habit.category}
              days={91}
            />
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.actionsRow}>
          <Pressable
            style={[
              styles.actionButton,
              Shadows.card,
              habit.isCompletedToday
                ? { backgroundColor: catConfig.color }
                : { backgroundColor: Colors.white, borderColor: catConfig.color, borderWidth: 2 },
            ]}
            onPress={() => toggleHabitCompletion(habit.id)}
          >
            <Ionicons
              name={habit.isCompletedToday ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={habit.isCompletedToday ? Colors.white : catConfig.color}
            />
            <Text
              style={[
                styles.actionText,
                { color: habit.isCompletedToday ? Colors.white : catConfig.color },
              ]}
            >
              {habit.isCompletedToday ? 'Completed Today ✓' : 'Mark as Done'}
            </Text>
          </Pressable>
        </Animated.View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.base,
  },
  heroCard: {
    margin: Spacing.base,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.base,
  },
  heroStats: {
    flex: 1,
    gap: Spacing.md,
  },
  heroStatRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  heroStatValue: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  heroStatLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  frequency: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heatmapCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    paddingHorizontal: Spacing.base,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    ...Typography.body,
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  notFoundText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  backLink: {
    ...Typography.body,
    color: Colors.work,
    fontWeight: '700',
  },
});
 // Habit detail screen view
