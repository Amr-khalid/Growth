/**
 * CategoryManagerModal — Add & Edit Custom Categories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useCategories } from '../../hooks/useCategories';
import { useLanguage } from '../../context/LanguageContext';
import type { CustomCategory } from '../../types';

interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

const COLOR_SWATCHES = [
  '#4F46E5', // Royal Indigo
  '#059669', // Emerald Green
  '#E11D48', // Coral Rose
  '#D97706', // Warm Gold
  '#7C3AED', // Vivid Violet
  '#0D9488', // Teal
  '#0284C7', // Sky Blue
  '#DB2777', // Bright Pink
  '#EA580C', // Orange
];

const EMOJI_OPTIONS = ['💼', '💪', '❤️', '💰', '🎯', '🚀', '📚', '🧘', '🎨', '⚽', '💻', '✈️', '🌟', '🧠'];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  visible,
  onClose,
  onSelectCategory,
}) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { language } = useLanguage();

  const [label, setLabel] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💼');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isEditing = Boolean(editingId);

  const resetForm = () => {
    setLabel('');
    setSelectedEmoji('💼');
    setSelectedColor(COLOR_SWATCHES[0]);
    setEditingId(null);
  };

  const handleStartEdit = (category: CustomCategory) => {
    Haptics.selectionAsync();
    setEditingId(category.id);
    setLabel(category.label);
    setSelectedEmoji(category.emoji || '💼');
    setSelectedColor(category.color || COLOR_SWATCHES[0]);
  };

  const handleSave = async () => {
    if (!label.trim()) return;

    if (isEditing && editingId) {
      await updateCategory(editingId, label.trim(), selectedEmoji, selectedColor);
    } else {
      const newId = await addCategory(label.trim(), selectedEmoji, selectedColor);
      if (onSelectCategory && newId) {
        onSelectCategory(newId);
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteCategory(id);
    if (editingId === id) resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <Pressable style={[styles.container, Shadows.elevated]} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="pricetags" size={22} color={Colors.work} />
                <Text style={styles.headerTitle}>
                  {language === 'en' ? 'Manage Categories' : 'إدارة التصنيفات'}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Category List */}
              <Text style={styles.sectionLabel}>
                {language === 'en' ? 'Existing Categories' : 'التصنيفات الحالية'}
              </Text>
              <View style={styles.listContainer}>
                {categories.map((cat) => (
                  <View key={cat.id} style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.emojiChip, { backgroundColor: cat.color + '20' }]}>
                        <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                      </View>
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <Pressable style={styles.iconBtn} onPress={() => handleStartEdit(cat)}>
                        <Ionicons name="pencil" size={16} color={Colors.work} />
                      </Pressable>
                      {!cat.isDefault && (
                        <Pressable style={styles.iconBtn} onPress={() => handleDelete(cat.id)}>
                          <Ionicons name="trash-outline" size={16} color={Colors.error} />
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Add / Edit Form */}
              <View style={styles.formContainer}>
                <Text style={styles.sectionLabel}>
                  {isEditing
                    ? language === 'en'
                      ? 'Edit Category'
                      : 'تعديل التصنيف'
                    : language === 'en'
                    ? 'Add New Category'
                    : 'إضافة تصنيف جديد'}
                </Text>

                {/* Name Input */}
                <TextInput
                  style={styles.input}
                  placeholder={language === 'en' ? 'Category Name (e.g. Learning)' : 'اسم التصنيف (مثال: التعلم)'}
                  placeholderTextColor={Colors.textMuted}
                  value={label}
                  onChangeText={setLabel}
                />

                {/* Emoji Picker */}
                <Text style={styles.subLabel}>{language === 'en' ? 'Select Emoji' : 'اختر إيموجي'}</Text>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emojisRow}
                >
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      style={[styles.emojiOption, selectedEmoji === emoji && styles.emojiSelected]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedEmoji(emoji);
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Color Swatches */}
                <Text style={styles.subLabel}>{language === 'en' ? 'Select Accent Color' : 'اختر اللون'}</Text>
                <View style={styles.colorsRow}>
                  {COLOR_SWATCHES.map((color) => (
                    <Pressable
                      key={color}
                      style={[styles.colorSwatch, { backgroundColor: color }, selectedColor === color && styles.colorSelected]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedColor(color);
                      }}
                    >
                      {selectedColor === color && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </Pressable>
                  ))}
                </View>

                {/* Save / Cancel Buttons */}
                <View style={styles.btnRow}>
                  <Pressable
                    style={[styles.saveBtn, !label.trim() && styles.btnDisabled]}
                    disabled={!label.trim()}
                    onPress={handleSave}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.saveBtnText}>
                      {isEditing
                        ? language === 'en'
                          ? 'Update'
                          : 'حفظ التعديل'
                        : language === 'en'
                        ? 'Add Category'
                        : 'إضافة التصنيف'}
                    </Text>
                  </Pressable>
                  {isEditing && (
                    <Pressable style={styles.cancelBtn} onPress={resetForm}>
                      <Text style={styles.cancelBtnText}>{language === 'en' ? 'Cancel' : 'إلغاء'}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  container: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.base,
    gap: Spacing.base,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  modalScroll: {
    maxHeight: Dimensions.get('window').height * 0.65,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  listContainer: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emojiChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.bgSecondary,
  },
  formContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emojisRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiSelected: {
    borderColor: Colors.work,
    borderWidth: 2,
    backgroundColor: Colors.workBg,
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.work,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
});
 // Color picker selector
