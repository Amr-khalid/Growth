/**
 * TaskProofViewerModal — View Photo, Audio Voice Note & File Proof for Completed Tasks
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { VoiceRecorder } from './VoiceRecorder';
import { useLanguage } from '../../context/LanguageContext';
import type { Task } from '../../types';

interface TaskProofViewerModalProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
}

export const TaskProofViewerModal: React.FC<TaskProofViewerModalProps> = ({
  task,
  visible,
  onClose,
}) => {
  const { language } = useLanguage();

  if (!task) return null;

  const hasProof =
    task.proofImageUri || task.proofAudioUri || task.proofFileUri || task.proofNote;

  const openFile = async () => {
    if (task.proofFileUri) {
      try {
        await Linking.openURL(task.proofFileUri);
      } catch (e) {
        console.error('Could not open file URL', e);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, Shadows.elevated]} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="shield-checkmark-sharp" size={22} color={Colors.work} />
              <View>
                <Text style={styles.headerTitle}>
                  {language === 'en' ? 'Task Completion Proof' : 'إثبات ودليل تسليم المهمة'}
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

          <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
            {hasProof ? (
              <View style={styles.content}>
                {/* Image Proof */}
                {task.proofImageUri && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {language === 'en' ? '📷 Photo Proof' : '📷 صوّرة الإثبات المرفقة'}
                    </Text>
                    <Image source={{ uri: task.proofImageUri }} style={styles.proofImage} />
                  </View>
                )}

                {/* Voice Note Recording */}
                {task.proofAudioUri && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {language === 'en' ? '🎤 Recorded Voice Note' : '🎤 الملاحظة الصوتية المسجلة'}
                    </Text>
                    <VoiceRecorder initialAudioUri={task.proofAudioUri} readonly />
                  </View>
                )}

                {/* Attached File */}
                {task.proofFileUri && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {language === 'en' ? '📄 Attached Document' : '📄 المستند/الملف المرفق'}
                    </Text>
                    <Pressable style={styles.fileLinkBtn} onPress={openFile}>
                      <Ionicons name="document-attach" size={20} color={Colors.work} />
                      <Text style={styles.fileLinkText} numberOfLines={1}>
                        {language === 'en' ? 'Open Attached File' : 'فتح الملف المرفق'}
                      </Text>
                      <Ionicons name="open-outline" size={16} color={Colors.work} />
                    </Pressable>
                  </View>
                )}

                {/* Text Note */}
                {task.proofNote && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {language === 'en' ? '📝 Completion Note' : '📝 ملاحظة التسليم'}
                    </Text>
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>{task.proofNote}</Text>
                    </View>
                  </View>
                )}

                {/* Timestamp */}
                {task.completedAt && (
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.timeText}>
                      {language === 'en' ? 'Completed at: ' : 'تم التسليم في: '}
                      {new Date(task.completedAt).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="alert-circle-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyText}>
                  {language === 'en'
                    ? 'No media or proof attachments recorded for this task.'
                    : 'لم يتم إرفاق دليل أو ملفات لهذه المهمة.'}
                </Text>
              </View>
            )}
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
  content: {
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  proofImage: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.workBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.work,
  },
  fileLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.work,
  },
  noteBox: {
    backgroundColor: Colors.bgTertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
 // Preview zoom scale
