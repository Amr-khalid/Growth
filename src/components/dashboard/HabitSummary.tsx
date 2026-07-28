/**
 * HabitSummary Component — Horizontal scroll of today's habit indicators for light theme
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { CATEGORIES } from '../../constants/categories';
import type { HabitWithStats } from '../../types';

interface HabitSummaryProps {
  habits: HabitWithStats[];
  onToggle: (habitId: string) => void;
  onHabitPress: (habitId: string) => void;
}

export function HabitSummary({ habits, onToggle, onHabitPress }: HabitSummaryProps) {
  const completedCount = habits.filter((h) => h.isCompletedToday).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Habits 🔥</Text>
        <Text style={styles.counter}>
          {completedCount}/{habits.length} Done
        </Text>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={28} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No habits tracked for today</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {habits.map((habit, index) => (
            <HabitCircle
              key={habit.id}
              habit={habit}
              onToggle={onToggle}
              onPress={onHabitPress}
              index={index}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function HabitCircle({
  habit,
  onToggle,
  onPress,
  index,
}: {
  habit: HabitWithStats;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  index: number;
}) {
  const categoryColor = CATEGORIES[habit.category as keyof typeof CATEGORIES]?.color || Colors.work;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    onToggle(habit.id);
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).springify()}
      style={styles.habitItem}
    >
      <Pressable onLongPress={() => onPress(habit.id)} onPress={handleToggle}>
        <Animated.View
          style={[
            animatedStyle,
            styles.habitCircle,
            Shadows.card,
            habit.isCompletedToday
              ? { backgroundColor: categoryColor, borderColor: categoryColor }
              : { backgroundColor: Colors.white, borderColor: Colors.border },
          ]}
        >
          {habit.isCompletedToday ? (
            <Ionicons name="checkmark" size={22} color={Colors.white} />
          ) : (
            <Text style={[styles.habitEmoji]}>{CATEGORIES[habit.category as keyof typeof CATEGORIES]?.emoji || '🎯'}</Text>
          )}
        </Animated.View>
      </Pressable>
      <Text style={styles.habitName} numberOfLines={1}>
        {habit.name}
      </Text>
      {habit.currentStreak > 0 && (
        <Text style={[styles.streak, { color: categoryColor }]}>
          🔥 {habit.currentStreak}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  counter: {
    ...Typography.caption,
    color: Colors.work,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 4,
  },
  habitItem: {
    alignItems: 'center',
    width: 68,
  },
  habitCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  habitEmoji: {
    fontSize: 20,
  },
  habitName: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 68,
  },
  streak: {
    ...Typography.small,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
 // Metrics summary chart
