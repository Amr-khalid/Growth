import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

interface TaskCompletionModalProps {
  visible: boolean;
  taskTitle: string;
  onClose: () => void;
}

const MOTIVATIONAL_QUOTES = [
  'إنجاز رائع! خطوة جديدة نحو أهدافك 🎯',
  'استمر في التألق الإنجاز يصنع المستحيل! 🚀',
  'عاش يا بطل! استكمل سلسلة انتصاراتك اليوم ⚡',
  'كل مهمة تنجزها تقربك خطوة من حلمك ⭐',
  'أداء ممتاااز! إنتاجيتك في أعلى مستوياتها 🔥',
];

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  visible,
  taskTitle,
  onClose,
}) => {
  const { isRTL } = useLanguage();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  const quoteIndex = useRef(0);

  useEffect(() => {
    if (visible) {
      quoteIndex.current = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
      
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      // Reset values
      scaleAnim.setValue(0.3);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);
      particleAnim.setValue(0);

      // Run Legendary Animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after 2.2 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  const particleScale = particleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.4, 1.2],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.9, 0],
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleDismiss}>
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Animated.View
          style={[
            styles.cardContainer,
            Shadows.elevated,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            },
          ]}
        >
          {/* Confetti & Sparkles Background Burst */}
          <Animated.View
            style={[
              styles.sparkleRing,
              {
                opacity: particleOpacity,
                transform: [{ scale: particleScale }],
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨  🌟  🎉  ✨  💫</Text>
          </Animated.View>

          {/* Trophy / Gold Badge Header */}
          <View style={styles.trophyContainer}>
            <View style={styles.glowBg} />
            <Text style={styles.trophyEmoji}>🏆</Text>
          </View>

          {/* Celebration Header */}
          <Text style={styles.congratsTitle}>
            {isRTL ? 'إنجاز أسطوري! 🎉' : 'Legendary Achievement! 🎉'}
          </Text>

          {/* Motivational Quote */}
          <Text style={styles.quoteText}>
            {MOTIVATIONAL_QUOTES[quoteIndex.current]}
          </Text>

          {/* Task Title Pill */}
          <View style={styles.taskTitleCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.taskTitleText} numberOfLines={1}>
              {taskTitle}
            </Text>
          </View>

          {/* Tap to continue caption */}
          <Text style={styles.tapCaption}>
            {isRTL ? 'اضغط للمتابعة ✨' : 'Tap anywhere to continue ✨'}
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FEF08A',
  },
  sparkleRing: {
    position: 'absolute',
    top: -20,
  },
  sparkleText: {
    fontSize: 22,
    letterSpacing: 8,
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF9C3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FDE047',
    position: 'relative',
  },
  glowBg: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(250, 204, 21, 0.25)',
  },
  trophyEmoji: {
    fontSize: 44,
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  taskTitleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    width: '100%',
    marginBottom: 16,
  },
  taskTitleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  tapCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
