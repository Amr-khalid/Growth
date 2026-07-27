/**
 * TaskItem Component — Modern, luxurious task card with image preview & micro-animations
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useCategories } from '../../hooks/useCategories';
import type { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onViewProof?: (task: Task) => void;
  index: number;
}

export function TaskItem({ task, onToggle, onDelete, onViewProof, index }: TaskItemProps) {
  const { categories } = useCategories();

  const categoryConfig = categories.find((c) => c.id === task.category) || {
    label: task.category,
    emoji: '🎯',
    color: Colors.work,
  };

  const scale = useSharedValue(1);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.35, { damping: 6, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    onToggle(task.id);
  };

  const hasProofMedia =
    task.proofImageUri || task.proofAudioUri || task.proofFileUri || task.proofNote;

  return (
    <Animated.View entering={FadeInDown.delay(index * 45).springify()}>
      <View
        style={[
          styles.container,
          Shadows.card,
          task.isCompleted && styles.containerCompleted,
        ]}
      >
        {/* Category Accent Stripe */}
        <View style={[styles.accentLine, { backgroundColor: categoryConfig.color }]} />

        <Pressable onPress={handleToggle} style={styles.row}>
          {/* Checkbox Button */}
          <Animated.View style={checkAnimStyle}>
            <View
              style={[
                styles.checkbox,
                task.isCompleted
                  ? { backgroundColor: categoryConfig.color, borderColor: categoryConfig.color }
                  : { borderColor: '#CBD5E1' },
              ]}
            >
              {task.isCompleted && (
                <Ionicons name="checkmark" size={13} color={Colors.white} />
              )}
            </View>
          </Animated.View>

          {/* Task Info Content */}
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                task.isCompleted && styles.titleCompleted,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {/* Attached Image Thumbnail (If Present) */}
            {task.proofImageUri ? (
              <View style={styles.imageThumbnailContainer}>
                <Image source={{ uri: task.proofImageUri }} style={styles.imageThumbnail} resizeMode="cover" />
              </View>
            ) : null}

            {/* Badges & Meta Row */}
            <View style={styles.metaRow}>
              {/* Category Pill */}
              <View style={[styles.catPill, { backgroundColor: categoryConfig.color + '15' }]}>
                <Text style={{ fontSize: 11 }}>{categoryConfig.emoji}</Text>
                <Text style={[styles.catPillText, { color: categoryConfig.color }]}>
                  {categoryConfig.label}
                </Text>
              </View>

              {/* Daily Mission Badge */}
              {task.isDailyMission && (
                <View style={styles.missionBadge}>
                  <Ionicons name="star" size={10} color={Colors.warning} />
                  <Text style={styles.missionText}>مهمة يومية</Text>
                </View>
              )}

              {/* Require Proof Badge */}
              {task.requireProof && !task.isCompleted && (
                <View style={styles.proofReqBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={Colors.work} />
                  <Text style={styles.proofReqText}>إثبات مطلوب</Text>
                </View>
              )}

              {/* Voice Note Badge */}
              {task.proofAudioUri && (
                <View style={styles.audioBadge}>
                  <Ionicons name="mic-outline" size={10} color={Colors.work} />
                  <Text style={styles.audioBadgeText}>صوت</Text>
                </View>
              )}

              {/* View Proof Button */}
              {hasProofMedia && task.isCompleted && onViewProof && (
                <Pressable
                  style={styles.viewProofBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onViewProof(task);
                  }}
                >
                  <Ionicons name="eye" size={11} color={Colors.health} />
                  <Text style={styles.viewProofText}>الإثبات 🔍</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Delete Button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDelete(task.id);
            }}
            hitSlop={10}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={17} color={Colors.textMuted} />
          </Pressable>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: Spacing.base,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  containerCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.85,
  },
  accentLine: {
    width: 4,
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  titleCompleted: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  imageThumbnailContainer: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 160,
  },
  imageThumbnail: {
    width: '100%',
    height: 95,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  missionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  missionText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  proofReqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  proofReqText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '700',
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  audioBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '700',
  },
  viewProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  viewProofText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
    marginTop: 2,
  },
});
