/**
 * HabitCard Component — Habit card tuned for light theme
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
import { Card } from '../ui/Card';
import { Badge, StreakBadge } from '../ui/Badge';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import type { HabitWithStats } from '../../types';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (habitId: string) => void;
  onPress: (habitId: string) => void;
  index: number;
}

export function HabitCard({ habit, onToggle, onPress, index }: HabitCardProps) {
  const categoryConfig = CATEGORIES[habit.category as keyof typeof CATEGORIES] || {
    key: habit.category,
    label: habit.category,
    emoji: '🎯',
    icon: 'bookmark',
    color: Colors.work,
    bgColor: Colors.workBg,
  };
  const scale = useSharedValue(1);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    onToggle(habit.id);
  };

  const frequencyLabel = () => {
    switch (habit.frequency) {
      case 'daily': return 'Every day';
      case 'weekly': return 'Weekly';
      case 'specific_days': return `${habit.specificDays?.length || 0} days/week`;
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Card
        style={styles.card}
        onPress={() => onPress(habit.id)}
        glowColor={habit.isCompletedToday ? categoryConfig.color : undefined}
      >
        <View style={styles.row}>
          {/* Checkbox */}
          <Pressable onPress={handleToggle} hitSlop={8}>
            <Animated.View style={checkAnimStyle}>
              <View
                style={[
                  styles.checkbox,
                  habit.isCompletedToday
                    ? { backgroundColor: categoryConfig.color, borderColor: categoryConfig.color }
                    : { borderColor: Colors.border, backgroundColor: Colors.bgSecondary },
                ]}
              >
                {habit.isCompletedToday && (
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                )}
              </View>
            </Animated.View>
          </Pressable>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={[
                styles.name,
                habit.isCompletedToday && styles.nameCompleted,
              ]} numberOfLines={1}>
                {habit.name}
              </Text>
              <StreakBadge count={habit.currentStreak} color={categoryConfig.color} />
            </View>
            <View style={styles.bottomRow}>
              <Badge category={habit.category} />
              <Text style={styles.frequency}>{frequencyLabel()}</Text>
            </View>
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameCompleted: {
    color: Colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  frequency: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
 // Haptic feedback tuning
