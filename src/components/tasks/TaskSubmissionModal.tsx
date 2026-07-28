/**
 * TaskSubmissionModal — Complete Task with Photo, Voice Note & File Proof
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { VoiceRecorder } from './VoiceRecorder';
import { useLanguage } from '../../context/LanguageContext';
import { useAlert } from '../../context/CustomAlertContext';
import type { Task } from '../../types';

interface TaskSubmissionModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    taskId: string,
    proof: {
      imageUri?: string;
      audioUri?: string;
      fileUri?: string;
      note?: string;
    }
  ) => Promise<void>;
}

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
  task,
  visible,
  onClose,
  onSubmit,
}) => {
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setImageUri(null);
    setAudioUri(null);
    setFileUri(null);
    setFileName(null);
    setNote('');
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert({
          title: language === 'en' ? 'Permission Denied' : 'الإذن مطلوب',
          message: language === 'en' ? 'Media library permission is required to select photos.' : 'يتطلب اختيار الصور الإذن بالوصول لمعرض الصور.',
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
        setImageUri(result.assets[0].uri);
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
          title: language === 'en' ? 'Permission Denied' : 'الإذن مطلوب',
          message: language === 'en' ? 'Camera permission is required to take photos.' : 'يتطلب التقاط الصور الإذن بالوصول للكاميرا.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error launching camera:', e);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFileUri(file.uri);
        setFileName(file.name);
      }
    } catch (e) {
      console.error('Error picking document:', e);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;
    setSubmitting(true);
    try {
      await onSubmit(task.id, {
        imageUri: imageUri || undefined,
        audioUri: audioUri || undefined,
        fileUri: fileUri || undefined,
        note: note.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (e) {
      showAlert({
        title: language === 'en' ? 'Error' : 'خطأ',
        message: language === 'en' ? 'Failed to submit task proof.' : 'فشل في تقديم إثبات المهمة.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, Shadows.elevated]} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="checkmark-done-circle" size={24} color={Colors.health} />
              <View>
                <Text style={styles.headerTitle}>
                  {language === 'en' ? 'Task Completion & Proof' : 'تسليم المهمة وإثبات الإنجاز'}
                </Text>

                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            {/* Section 1: Photo Attachment */}
            <Text style={styles.sectionLabel}>
              {language === 'en' ? '📷 Photo Proof' : '📷 إرفاق صورة الإثبات'}
            </Text>
            {imageUri ? (
              <View style={styles.imagePreviewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <Pressable style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoActionRow}>
                <Pressable style={styles.mediaBtn} onPress={handleCamera}>
                  <Ionicons name="camera-outline" size={20} color={Colors.work} />
                  <Text style={styles.mediaBtnText}>
                    {language === 'en' ? 'Take Photo' : 'التقاط صورة'}
                  </Text>
                </Pressable>
                <Pressable style={styles.mediaBtn} onPress={handlePickImage}>
                  <Ionicons name="images-outline" size={20} color={Colors.work} />
                  <Text style={styles.mediaBtnText}>
                    {language === 'en' ? 'Gallery' : 'من المعرض'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Section 2: Voice Note Recording */}
            <Text style={styles.sectionLabel}>
              {language === 'en' ? '🎤 Voice Audio Note' : '🎤 تسجيل صوتي (Voice Note)'}
            </Text>
            <VoiceRecorder
              initialAudioUri={audioUri}
              onAudioRecorded={(uri) => setAudioUri(uri)}
            />

            {/* Section 3: File Attachment */}
            <Text style={styles.sectionLabel}>
              {language === 'en' ? '📄 Document / File Proof' : '📄 إرفاق مستند أو ملف'}
            </Text>
            {fileUri ? (
              <View style={styles.fileBox}>
                <Ionicons name="document-attach-outline" size={20} color={Colors.work} />
                <Text style={styles.fileNameText} numberOfLines={1}>
                  {fileName || 'File Attached'}
                </Text>
                <Pressable onPress={() => setFileUri(null)}>
                  <Ionicons name="close-circle" size={18} color={Colors.error} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.filePickerBtn} onPress={handlePickFile}>
                <Ionicons name="folder-open-outline" size={20} color={Colors.work} />
                <Text style={styles.mediaBtnText}>
                  {language === 'en' ? 'Attach File' : 'إرفاق ملف من الجهاز'}
                </Text>
              </Pressable>
            )}

            {/* Section 4: Completion Note */}
            <Text style={styles.sectionLabel}>
              {language === 'en' ? '📝 Completion Note' : '📝 ملاحظة الإنجاز'}
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder={
                language === 'en'
                  ? 'Add a short note about how you finished this task...'
                  : 'ملاحظة توضيحية حول تسليم المهمة...'
              }
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
            />

            {/* Submit Action Button */}
            <Pressable
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Ionicons name="checkmark-done" size={22} color="#FFF" />
              <Text style={styles.submitBtnText}>
                {submitting
                  ? language === 'en'
                    ? 'Submitting...'
                    : 'جاري التسليم...'
                  : language === 'en'
                  ? 'Submit & Complete Task'
                  : 'تسليم وإنجاز المهمة ✨'}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.base,
    gap: Spacing.sm,
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
    gap: Spacing.sm,
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  taskTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.workBg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.work,
  },
  mediaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.work,
  },
  imagePreviewBox: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  filePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bgTertiary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.workBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.work,
  },
  fileNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noteInput: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.health,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
 // File upload layout
