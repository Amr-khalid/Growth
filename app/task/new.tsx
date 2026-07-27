/**
 * New Task Modal — Form to create a new task (Light Theme)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { CATEGORY_LIST } from '../../src/constants/categories';
import { useTasks } from '../../src/hooks/useTasks';
import { useCategories } from '../../src/hooks/useCategories';
import { CategoryManagerModal } from '../../src/components/categories/CategoryManagerModal';
import { Button } from '../../src/components/ui/Button';
import type { LifeCategory } from '../../src/types';

import { useAlert } from '../../src/context/CustomAlertContext';
import { VoiceRecorder } from '../../src/components/tasks/VoiceRecorder';

export default function NewTaskScreen() {
  const router = useRouter();
  const { addTask } = useTasks();
  const { categories } = useCategories();
  const { showAlert } = useAlert();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LifeCategory>('work');
  const [isDailyMission, setIsDailyMission] = useState(false);
  const [requireProof, setRequireProof] = useState(false);
  const [initialImageUri, setInitialImageUri] = useState<string | null>(null);
  const [initialAudioUri, setInitialAudioUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: 'الإذن مطلوب',
          message: 'يتطلب اختيار الصور الإذن بالوصول لمعرض الصور.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setInitialImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error picking image:', e);
    }
  };

  const handleCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: 'الإذن مطلوب',
          message: 'يتطلب التقاط الصور الإذن بالوصول للكاميرا.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setInitialImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error launching camera:', e);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showAlert({
        title: 'العنوان مطلوب',
        message: 'يرجى إدخال عنوان للمهمة أولاً.',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      await addTask(title.trim(), category, isDailyMission, undefined, {
        requireProof,
        proofImageUri: initialImageUri || undefined,
        proofAudioUri: initialAudioUri || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error creating task:', error);
      showAlert({
        title: 'خطأ',
        message: 'فشل في إنشاء المهمة.',
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
        <Text style={styles.headerTitle}>New Task 📋</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.label}>Task Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Finish Q3 roadmap slides"
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
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

        {/* Daily Mission Toggle */}
        <View style={[styles.toggleRow, Shadows.card]}>
          <View style={styles.toggleInfo}>
            <View style={styles.toggleTitleRow}>
              <Ionicons name="star" size={20} color={Colors.warning} />
              <Text style={styles.toggleTitle}>Daily Mission</Text>
            </View>
            <Text style={styles.toggleDesc}>
              Pin as a top priority mission on your Dashboard
            </Text>
          </View>
          <Switch
            value={isDailyMission}
            onValueChange={(v) => {
              Haptics.selectionAsync();
              setIsDailyMission(v);
            }}
            trackColor={{ false: Colors.bgTertiary, true: Colors.warning + '66' }}
            thumbColor={isDailyMission ? Colors.warning : Colors.textMuted}
          />
        </View>

        {/* Require Proof Toggle */}
        <View style={[styles.toggleRow, Shadows.card]}>
          <View style={styles.toggleInfo}>
            <View style={styles.toggleTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.work} />
              <Text style={styles.toggleTitle}>طلب إثبات عند التسليم (Require Proof)</Text>
            </View>
            <Text style={styles.toggleDesc}>
              إلزام إرفاق صورة، تسجيل صوتي أو ملف كدليل على الإنجاز عند إنهاء المهمة
            </Text>
          </View>
          <Switch
            value={requireProof}
            onValueChange={(v) => {
              Haptics.selectionAsync();
              setRequireProof(v);
            }}
            trackColor={{ false: Colors.bgTertiary, true: Colors.work + '66' }}
            thumbColor={requireProof ? Colors.work : Colors.textMuted}
          />
        </View>

        {/* Initial Image Attachment */}
        <Text style={styles.label}>صورة للمهمة (اختياري)</Text>
        {initialImageUri ? (
          <View style={[styles.imagePreviewContainer, Shadows.card]}>
            <Image source={{ uri: initialImageUri }} style={styles.imagePreview} resizeMode="cover" />
            <Pressable
              style={styles.removeImageBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setInitialImageUri(null);
              }}
            >
              <Ionicons name="close" size={18} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.imagePickerRow}>
            <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
              <Ionicons name="images-outline" size={20} color={Colors.work} />
              <Text style={styles.imagePickerText}>المعرض</Text>
            </Pressable>
            <Pressable style={styles.imagePickerBtn} onPress={handleCamera}>
              <Ionicons name="camera-outline" size={20} color={Colors.work} />
              <Text style={styles.imagePickerText}>الكاميرا</Text>
            </Pressable>
          </View>
        )}

        {/* Initial Voice Note Attachment */}
        <Text style={styles.label}>ملاحظة صوتية للمهمة (اختياري)</Text>
        <VoiceRecorder
          initialAudioUri={initialAudioUri}
          onAudioRecorded={(uri) => setInitialAudioUri(uri)}
        />

        {/* Save Button */}
        <View style={styles.saveArea}>
          <Button
            title="Create Task"
            onPress={handleSave}
            variant="filled"
            color={Colors.work}
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginTop: Spacing.xl,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.base,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  toggleDesc: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 3,
    marginLeft: 28,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgTertiary,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  imagePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imagePickerText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  saveArea: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['4xl'],
  },
});
