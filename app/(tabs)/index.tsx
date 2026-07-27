/**
 * Dashboard Screen — The cockpit of Personal Growth OS (Light Theme)
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { CATEGORY_LIST } from '../../src/constants/categories';
import { getGreeting, formatDisplayDate } from '../../src/utils/dateHelpers';
import { useHabits } from '../../src/hooks/useHabits';
import { useTasks } from '../../src/hooks/useTasks';
import { useStreakAndActivity } from '../../src/hooks/useStreakAndActivity';
import { DailyMission } from '../../src/components/dashboard/DailyMission';
import { HabitSummary } from '../../src/components/dashboard/HabitSummary';
import { LifeOverview } from '../../src/components/dashboard/LifeOverview';
import { StreakGraceWidget } from '../../src/components/calendar/StreakGraceWidget';
import type { LifeCategory } from '../../src/types';

import { useLanguage } from '../../src/context/LanguageContext';
import { LanguageSwitcher } from '../../src/components/ui/LanguageSwitcher';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { streakStats, refresh: refreshStreak } = useStreakAndActivity();

  const {
    todayHabits,
    completedToday: habitsCompleted,
    totalToday: habitsTotal,
    toggleHabitCompletion,
    refresh: refreshHabits,
  } = useHabits();

  const {
    dailyMissions,
    todayTasks,
    completedToday: tasksCompleted,
    totalToday: tasksTotal,
    toggleTask,
    refresh: refreshTasks,
  } = useTasks();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshHabits(), refreshTasks(), refreshStreak()]);
    setRefreshing(false);
  }, [refreshHabits, refreshTasks, refreshStreak]);

  const handleToggleHabit = async (id: string) => {
    await toggleHabitCompletion(id);
    await refreshStreak();
  };

  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
    await refreshStreak();
  };

  const categoryProgress = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const catTasks = todayTasks.filter((t) => t.category === cat.key);
      const catHabits = todayHabits.filter((h) => h.category === cat.key);

      const totalItems = catTasks.length + catHabits.length;
      const completedItems =
        catTasks.filter((t) => t.isCompleted).length +
        catHabits.filter((h) => h.isCompletedToday).length;

      return {
        category: cat.key as LifeCategory,
        percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      };
    });
  }, [todayTasks, todayHabits]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.work}
            colors={[Colors.work]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} ☀️</Text>
              <Text style={styles.date}>{formatDisplayDate(new Date())}</Text>
            </View>
            <LanguageSwitcher />
          </View>
          <View style={[styles.statsRow, Shadows.card]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasksCompleted}/{tasksTotal}</Text>
              <Text style={styles.statLabel}>{t('tasksDone')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{habitsCompleted}/{habitsTotal}</Text>
              <Text style={styles.statLabel}>{t('habitsDone')}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Streak & Grace Widget */}
        <View style={{ paddingHorizontal: Spacing.base }}>
          <StreakGraceWidget stats={streakStats} />
        </View>

        {/* Daily Mission */}
        <DailyMission
          missions={dailyMissions}
          onToggle={handleToggleTask}
          onAddPress={() => router.push('/task/new')}
        />

        {/* Habits Today */}
        <HabitSummary
          habits={todayHabits}
          onToggle={handleToggleHabit}
          onHabitPress={(id) => router.push(`/habit/${id}`)}
        />

        {/* Life Overview */}
        <LifeOverview data={categoryProgress} />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={[styles.fab, Shadows.glow(Colors.work)]}
        onPress={() => router.push('/task/new')}
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
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    ...Typography.display,
    color: Colors.textPrimary,
  },
  date: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.work,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
});
