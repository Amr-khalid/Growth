/**
 * DailyMission Component — Priority daily tasks card tuned for light theme
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import { Card } from '../ui/Card';
import type { Task } from '../../types';

interface DailyMissionProps {
  missions: Task[];
  onToggle: (taskId: string) => void;
  onAddPress: () => void;
}

export function DailyMission({ missions, onToggle, onAddPress }: DailyMissionProps) {
  const completed = missions.filter((m) => m.isCompleted).length;
  const total = missions.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Mission 🎯</Text>
          <Text style={styles.subtitle}>
            {completed}/{total} completed today
          </Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: `${progress}%` },
          ]}
        />
      </View>

      {/* Mission Items */}
      {missions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="rocket-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No daily missions set</Text>
          <Text style={styles.emptySubtext}>Add tasks and mark them as daily missions</Text>
        </View>
      ) : (
        missions.map((mission, index) => (
          <MissionItem
            key={mission.id}
            mission={mission}
            onToggle={onToggle}
            index={index}
          />
        ))
      )}

      {/* Add Button */}
      {missions.length < 5 && (
        <Pressable style={styles.addButton} onPress={onAddPress}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.work} />
          <Text style={styles.addButtonText}>Add Mission Task</Text>
        </Pressable>
      )}
    </Card>
  );
}

function MissionItem({
  mission,
  onToggle,
  index,
}: {
  mission: Task;
  onToggle: (id: string) => void;
  index: number;
}) {
  const categoryColor = CATEGORIES[mission.category].color;
  const checkScale = useSharedValue(1);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    checkScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    onToggle(mission.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={styles.missionItem}
    >
      <Pressable onPress={handleToggle} style={styles.missionRow}>
        <Animated.View style={[checkAnimatedStyle]}>
          <View
            style={[
              styles.checkbox,
              mission.isCompleted && {
                backgroundColor: categoryColor,
                borderColor: categoryColor,
              },
              !mission.isCompleted && { borderColor: Colors.border },
            ]}
          >
            {mission.isCompleted && (
              <Ionicons name="checkmark" size={14} color={Colors.white} />
            )}
          </View>
        </Animated.View>
        <Text
          style={[
            styles.missionText,
            mission.isCompleted && styles.missionCompleted,
          ]}
          numberOfLines={1}
        >
          {mission.title}
        </Text>
        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: Colors.workBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    ...Typography.small,
    color: Colors.work,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 3,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  missionItem: {
    marginBottom: Spacing.xs,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.bgSecondary,
  },
  missionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  missionCompleted: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    backgroundColor: Colors.workBg,
    borderRadius: BorderRadius.sm,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.work,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
});
