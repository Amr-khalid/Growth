/**
 * StreakGraceWidget — Visual Streak Header with 3-Day Grace Period Tracker
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import type { StreakGraceResult } from '../../utils/streakCalculator';

import { useLanguage } from '../../context/LanguageContext';

interface StreakGraceWidgetProps {
  stats: StreakGraceResult;
}

export const StreakGraceWidget: React.FC<StreakGraceWidgetProps> = ({ stats }) => {
  const { t } = useLanguage();
  const { currentStreak, longestStreak, graceDaysRemaining, isGraceActive, daysSinceLastActivity } = stats;

  return (
    <Animated.View entering={FadeInDown.springify()} style={[styles.container, Shadows.card]}>
      {/* Top Banner Row */}
      <View style={styles.headerRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={24} color="#F97316" />
          <View style={styles.streakTextCol}>
            <Text style={styles.streakCount}>{currentStreak} <Text style={styles.unitText}>{t('daysUnit')}</Text></Text>
            <Text style={styles.streakLabel}>{t('currentStreak')}</Text>
          </View>
        </View>

        <View style={styles.recordBadge}>
          <Ionicons name="trophy" size={20} color="#D97706" />
          <View style={styles.recordTextCol}>
            <Text style={styles.recordValue}>{longestStreak} {t('dayUnit')}</Text>
            <Text style={styles.recordLabel}>{t('longestStreak')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Grace Days Section */}
      <View style={styles.graceSection}>
        <View style={styles.graceHeader}>
          <View style={styles.graceTitleRow}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.work} />
            <Text style={styles.graceTitle}>{t('graceDaysTitle')}</Text>
          </View>
          <Text style={styles.graceCounter}>{graceDaysRemaining}/3 {t('graceDaysRemaining')}</Text>
        </View>

        {/* 3 Shields Indicator */}
        <View style={styles.shieldsRow}>
          {[1, 2, 3].map((shieldNum) => {
            const isAvailable = shieldNum <= graceDaysRemaining;
            return (
              <View
                key={shieldNum}
                style={[
                  styles.shieldBox,
                  isAvailable ? styles.shieldBoxAvailable : styles.shieldBoxUsed,
                ]}
              >
                <Ionicons
                  name={isAvailable ? 'shield-sharp' : 'shield-outline'}
                  size={20}
                  color={isAvailable ? Colors.work : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.shieldText,
                    isAvailable ? styles.shieldTextAvailable : styles.shieldTextUsed,
                  ]}
                >
                  {t('graceShield')} {shieldNum}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Warning / Status Messages */}
        {isGraceActive && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={styles.warningText}>
              {t('inGraceNotice', { day: daysSinceLastActivity })}
            </Text>
          </View>
        )}

        {daysSinceLastActivity > 3 && currentStreak === 0 && (
          <View style={styles.resetBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.resetText}>
              {t('streakResetNotice')}
            </Text>
          </View>
        )}

        {daysSinceLastActivity === 0 && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
            <Text style={styles.successText}>
              {t('streakSuccessNotice')}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakTextCol: {},
  streakCount: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  streakLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.bgTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  recordTextCol: {
    alignItems: 'flex-end',
  },
  recordValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recordLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  graceSection: {
    gap: Spacing.sm,
  },
  graceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  graceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  graceTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  graceCounter: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.work,
  },
  shieldsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  shieldBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  shieldBoxAvailable: {
    backgroundColor: Colors.workBg,
    borderColor: Colors.work,
  },
  shieldBoxUsed: {
    backgroundColor: Colors.bgTertiary,
    borderColor: Colors.border,
  },
  shieldText: {
    fontSize: 11,
    fontWeight: '600',
  },
  shieldTextAvailable: {
    color: Colors.work,
  },
  shieldTextUsed: {
    color: Colors.textMuted,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEF3C7',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: Spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  resetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEE2E2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.xs,
  },
  resetText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.healthBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.success,
    marginTop: Spacing.xs,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    color: Colors.health,
    fontWeight: '600',
  },
});
 // Protection status indicator
