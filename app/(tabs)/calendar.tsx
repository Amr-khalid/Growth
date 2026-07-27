/**
 * Calendar Screen — Interactive Activity Calendar & 3-Day Grace Streak Tracker
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useStreakAndActivity } from '../../src/hooks/useStreakAndActivity';
import { StreakGraceWidget } from '../../src/components/calendar/StreakGraceWidget';
import { ActivityCalendar } from '../../src/components/calendar/ActivityCalendar';

import { useLanguage } from '../../src/context/LanguageContext';
import { LanguageSwitcher } from '../../src/components/ui/LanguageSwitcher';

export default function CalendarScreen() {
  const { t } = useLanguage();
  const { streakStats, getDayDetails, refresh, loading } = useStreakAndActivity();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.work}
            colors={[Colors.work]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('calendarTitle')}</Text>
              <Text style={styles.subtitle}>{t('calendarSubtitle')}</Text>
            </View>
            <LanguageSwitcher />
          </View>
        </Animated.View>

        {/* Streak & 3-Day Grace Widget */}
        <StreakGraceWidget stats={streakStats} />

        {/* Monthly Activity Calendar Grid */}
        <ActivityCalendar stats={streakStats} getDayDetails={getDayDetails} />

        {/* Info Card explaining 3-Day Grace Rules */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.infoCard, Shadows.card]}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.work} />
            <Text style={styles.infoCardTitle}>{t('graceRulesTitle')}</Text>
          </View>
          <Text style={styles.infoText}>
            • {t('graceRule1')}
          </Text>
          <Text style={styles.infoText}>
            • {t('graceRule2')}
          </Text>
          <Text style={styles.infoText}>
            • {t('graceRule3')}
          </Text>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  header: {
    paddingVertical: Spacing.base,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.display,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  infoCardTitle: {
    ...Typography.subheading,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
