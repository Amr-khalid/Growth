/**
 * Tasks Screen — Modern, luxurious task dashboard with daily progress & completion celebration
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useTasks } from '../../src/hooks/useTasks';
import { useCategories } from '../../src/hooks/useCategories';
import { TaskItem } from '../../src/components/tasks/TaskItem';
import { TaskSubmissionModal } from '../../src/components/tasks/TaskSubmissionModal';
import { TaskProofViewerModal } from '../../src/components/tasks/TaskProofViewerModal';
import { TaskCompletionModal } from '../../src/components/tasks/TaskCompletionModal';
import { Card } from '../../src/components/ui/Card';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import type { Task } from '../../src/types';

export default function TasksScreen() {
  const router = useRouter();
  const { todayTasks, toggleTask, submitTaskProof, deleteTask, refresh } = useTasks();
  const { categories, refresh: refreshCategories } = useCategories();

  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Celebration state
  const [celebrationTaskTitle, setCelebrationTaskTitle] = useState<string | null>(null);

  // Modals state
  const [submittingTask, setSubmittingTask] = useState<Task | null>(null);
  const [viewingProofTask, setViewingProofTask] = useState<Task | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshCategories()]);
    setRefreshing(false);
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = todayTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.requireProof && !task.isCompleted) {
      setSubmittingTask(task);
    } else {
      const willBeCompleted = !task.isCompleted;
      await toggleTask(taskId);

      if (willBeCompleted) {
        setCelebrationTaskTitle(task.title);
      }
    }
  };

  const filteredTasks = useMemo(() => {
    let tasks = todayTasks;
    if (filter !== 'all') {
      tasks = tasks.filter((t) => t.category === filter);
    }
    return tasks;
  }, [todayTasks, filter]);

  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted);
  const completedTasks = filteredTasks.filter((t) => t.isCompleted);

  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter((t) => t.isCompleted).length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const filters = useMemo(() => {
    return [
      { key: 'all', label: 'الكل ✨', color: Colors.work },
      ...categories.map((c) => ({
        key: c.id,
        label: `${c.emoji} ${c.label}`,
        color: c.color,
      })),
    ];
  }, [categories]);

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
        {/* Screen Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={styles.title}>المهام اليومية 📋</Text>
          <Text style={styles.subtitle}>
            {pendingTasks.length} قيد الإنجاز · {completedTasks.length} مكتملة اليوم
          </Text>
        </Animated.View>

        {/* Daily Progress Summary Card */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Card style={styles.progressCard}>
            <View style={styles.progressRow}>
              <ProgressRing
                progress={completionPercentage}
                size={84}
                strokeWidth={7}
                color={Colors.work}
              />
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>
                  {completionPercentage === 100 && totalToday > 0
                    ? 'أنجزت جميع مهام اليوم! 🎉'
                    : `إنجاز اليوم: ${completionPercentage}%`}
                </Text>
                <Text style={styles.progressSubtext}>
                  مكتمل {completedToday} من أصل {totalToday} مهمة
                </Text>

                {/* Animated Progress Bar */}
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${completionPercentage}%`, backgroundColor: Colors.work },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Filter Chips Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((f) => {
            const isActive = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilter(f.key);
                }}
                style={[
                  styles.filterChip,
                  isActive && {
                    backgroundColor: f.color || Colors.work,
                    borderColor: f.color || Colors.work,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && { color: '#FFFFFF', fontWeight: '800' },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tasks List */}
        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="sparkles" size={36} color={Colors.work} />
            </View>
            <Text style={styles.emptyTitle}>لا توجد مهام اليوم</Text>
            <Text style={styles.emptySubtext}>
              أضف مهام يومية جديدة لتنظيم وقتك وتحقيق أهدافك بكل كفاءة
            </Text>
          </View>
        ) : (
          <>
            {pendingTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={deleteTask}
                onViewProof={(t) => setViewingProofTask(t)}
                index={index}
              />
            ))}

            {/* Completed Tasks Toggle Section */}
            {completedTasks.length > 0 && (
              <View style={styles.completedSection}>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowCompleted(!showCompleted);
                  }}
                  style={styles.completedHeader}
                >
                  <View style={styles.completedTitleRow}>
                    <Ionicons name="checkmark-done-circle" size={20} color={Colors.success} />
                    <Text style={styles.completedTitle}>
                      المهام المكتملة ({completedTasks.length})
                    </Text>
                  </View>
                  <Ionicons
                    name={showCompleted ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </Pressable>

                {showCompleted &&
                  completedTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleTaskToggle}
                      onDelete={deleteTask}
                      onViewProof={(t) => setViewingProofTask(t)}
                      index={index}
                    />
                  ))}
              </View>
            )}
          </>
        )}

        {/* Legendary Task Completion Celebration Modal */}
        <TaskCompletionModal
          visible={Boolean(celebrationTaskTitle)}
          taskTitle={celebrationTaskTitle || ''}
          onClose={() => setCelebrationTaskTitle(null)}
        />

        {/* Task Proof Submission Modal */}
        <TaskSubmissionModal
          task={submittingTask}
          visible={Boolean(submittingTask)}
          onClose={() => setSubmittingTask(null)}
          onSubmit={async (id, proof) => {
            await submitTaskProof(id, proof);
            if (submittingTask) {
              setCelebrationTaskTitle(submittingTask.title);
            }
          }}
        />

        {/* Task Proof Viewer Modal */}
        <TaskProofViewerModal
          task={viewingProofTask}
          visible={Boolean(viewingProofTask)}
          onClose={() => setViewingProofTask(null)}
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Modern Floating Action Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          Shadows.glow(Colors.work),
          pressed && styles.fabPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/task/new');
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
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
    paddingBottom: Spacing.sm,
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
  progressCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  barBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterScroll: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.workBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  completedSection: {
    marginTop: Spacing.base,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  completedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.work,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
