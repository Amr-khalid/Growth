import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface CustomAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  isConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const TYPE_CONFIGS: Record<
  AlertType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgTint: string;
    borderColor: string;
  }
> = {
  success: {
    icon: 'checkmark-circle-sharp',
    color: Colors.success,
    bgTint: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  error: {
    icon: 'alert-circle-sharp',
    color: Colors.error,
    bgTint: '#FEF2F2',
    borderColor: '#FECACA',
  },
  warning: {
    icon: 'warning-sharp',
    color: Colors.warning,
    bgTint: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  info: {
    icon: 'information-circle-sharp',
    color: Colors.info,
    bgTint: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
};

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  isConfirm = false,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { isRTL } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger subtle haptic feedback
      try {
        if (type === 'error' || type === 'warning') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (e) {
        // Haptics fallback on web/unsupported environments
      }

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, type]);

  if (!visible) return null;

  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.info;
  const defaultConfirmLabel = isRTL ? 'موافق' : 'OK';
  const defaultCancelLabel = isRTL ? 'إلغاء' : 'Cancel';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlayContainer}>
        <Pressable style={styles.backdrop} onPress={isConfirm ? onCancel : onConfirm} />
        
        <Animated.View
          style={[
            styles.alertCard,
            Shadows.elevated,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header Icon Badge */}
          <View style={[styles.iconBadge, { backgroundColor: config.bgTint, borderColor: config.borderColor }]}>
            <Ionicons name={config.icon} size={32} color={config.color} />
          </View>

          {/* Text Contents */}
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {title}
          </Text>
          {message ? (
            <Text style={[styles.message, { textAlign: isRTL ? 'right' : 'left' }]}>
              {message}
            </Text>
          ) : null}

          {/* Action Buttons */}
          <View style={[styles.buttonRow, isRTL && { flexDirection: 'row-reverse' }]}>
            {isConfirm && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>
                  {cancelText || defaultCancelLabel}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: type === 'error' ? Colors.error : Colors.info },
                pressed && styles.buttonPressed,
                isConfirm ? { flex: 1 } : { width: '100%' },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText || defaultConfirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  alertCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
  },
  title: {
    fontSize: Typography.heading.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    width: '100%',
  },
  message: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  button: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
