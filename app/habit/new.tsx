/**
 * New Habit Modal — Form to create a new habit (Light Theme)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { CATEGORY_LIST } from '../../src/constants/categories';
import { useHabits } from '../../src/hooks/useHabits';
import { useCategories } from '../../src/hooks/useCategories';
import { CategoryManagerModal } from '../../src/components/categories/CategoryManagerModal';
import { Button } from '../../src/components/ui/Button';
import type { LifeCategory, HabitFrequency } from '../../src/types';

import { useAlert } from '../../src/context/CustomAlertContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQUENCIES: { key: HabitFrequency; label: string; desc: string }[] = [
  { key: 'daily', label: 'Daily', desc: 'Every single day' },
  { key: 'weekly', label: 'Weekly', desc: 'Once a week' },
  { key: 'specific_days', label: 'Custom', desc: 'Pick specific days' },
];

export default function NewHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabits();
  const { categories } = useCategories();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<LifeCategory>('health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const toggleDay = (dayIndex: number) => {
    Haptics.selectionAsync();
    setSpecificDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert({
        title: 'الاسم مطلوب',
        message: 'يرجى إدخال اسم لعادة جديدة.',
        type: 'warning',
      });
      return;
    }
    if (frequency === 'specific_days' && specificDays.length === 0) {
      showAlert({
        title: 'حدد الأيام',
        message: 'يرجى اختيار يوم واحد على الأقل للعادة.',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      await addHabit(
        name.trim(),
        category,
        frequency,
        frequency === 'specific_days' ? specificDays : undefined
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      showAlert({
        title: 'خطأ',
        message: 'فشل في إنشاء العادة.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Habit ✨</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Morning Meditation, Read 20 pages"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
        />

        {/* Category Header Row */}
        <View style={styles.categoryHeaderRow}>
          <Text style={styles.label}>Category</Text>
          <Pressable style={styles.manageCatBtn} onPress={() => setShowCategoryManager(true)}>
            <Ionicons name="settings-outline" size={14} color={Colors.work} />
            <Text style={styles.manageCatText}>إدارة التصنيفات</Text>
          </Pressable>
        </View>

        {/* Category Options */}
        <View style={styles.optionGrid}>
          {categories.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(cat.id as LifeCategory);
                }}
                style={[
                  styles.optionCard,
                  Shadows.card,
                  isSelected && {
                    borderColor: cat.color,
                    backgroundColor: cat.color + '15',
                  },
                ]}
              >
                <Text style={styles.optionEmoji}>{cat.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  isSelected && { color: cat.color, fontWeight: '700' },
                ]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <CategoryManagerModal
          visible={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          onSelectCategory={(id) => setCategory(id as LifeCategory)}
        />

        {/* Frequency */}
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyRow}>
          {FREQUENCIES.map((freq) => {
            const isSelected = frequency === freq.key;
            return (
              <Pressable
                key={freq.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFrequency(freq.key);
                }}
                style={[
                  styles.frequencyCard,
                  Shadows.card,
                  isSelected && styles.frequencySelected,
                ]}
              >
                <Text style={[
                  styles.frequencyLabel,
                  isSelected && { color: Colors.work },
                ]}>
                  {freq.label}
                </Text>
                <Text style={styles.frequencyDesc}>{freq.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Specific Days */}
        {frequency === 'specific_days' && (
          <View style={styles.daysContainer}>
            <Text style={styles.label}>Select Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((day, index) => {
                const isSelected = specificDays.includes(index);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(index)}
                    style={[
                      styles.dayChip,
                      isSelected && styles.daySelected,
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && { color: Colors.white },
                    ]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={styles.saveArea}>
          <Button
            title="Create Habit"
            onPress={handleSave}
            variant="filled"
            color={Colors.health}
            size="lg"
            loading={saving}
            style={{ width: '100%' }}
          />
        </View>
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
  },
  form: {
    flex: 1,
    padding: Spacing.base,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manageCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.workBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  manageCatText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.work,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  frequencyRow: {
    gap: Spacing.sm,
  },
  frequencyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  frequencySelected: {
    borderColor: Colors.work,
    backgroundColor: Colors.workBg,
  },
  frequencyLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  frequencyDesc: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  daysContainer: {
    marginTop: Spacing.sm,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dayChip: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  daySelected: {
    backgroundColor: Colors.work,
    borderColor: Colors.work,
  },
  dayText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  saveArea: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['4xl'],
  },
});
