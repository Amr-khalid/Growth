/**
 * Habits Screen — Manage habits with streak tracking (Light Theme)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useHabits } from '../../src/hooks/useHabits';
import { HabitCard } from '../../src/components/habits/HabitCard';

export default function HabitsScreen() {
  const router = useRouter();
  const {
    habits,
    todayHabits,
    completedToday,
    totalToday,
    toggleHabitCompletion,
    refresh,
  } = useHabits();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const aDue = todayHabits.find((h) => h.id === a.id) ? 1 : 0;
    const bDue = todayHabits.find((h) => h.id === b.id) ? 1 : 0;
    if (aDue !== bDue) return bDue - aDue;
    return b.currentStreak - a.currentStreak;
  });

  const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.health}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={styles.title}>Habit Tracker ✨</Text>
          <Text style={styles.subtitle}>Build consistency, see visual progress</Text>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, Shadows.card]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{completedToday}/{totalToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, Shadows.card]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>{habits.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, Shadows.card]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Habits List */}
        {sortedHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No habits created yet</Text>
            <Text style={styles.emptySubtext}>
              Start building positive daily habits to track your personal growth
            </Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Your Habits</Text>
            {sortedHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
                onPress={(id) => router.push(`/habit/${id}`)}
                index={index}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <Pressable
        style={[styles.fab, Shadows.glow(Colors.health)]}
        onPress={() => router.push('/habit/new')}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
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
    paddingBottom: Spacing.md,
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.heading,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listSection: {
    paddingBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: {
    ...Typography.heading,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.health,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
});
