/**
 * ActivityCalendar Component — Interactive Monthly Calendar View
 * Visualizes active days (🟢), grace days (🛡️), and missed days (⚪).
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { toDateString } from '../../utils/dateHelpers';
import type { StreakGraceResult } from '../../utils/streakCalculator';
import type { DayActivityDetail } from '../../hooks/useStreakAndActivity';

import { useLanguage } from '../../context/LanguageContext';

interface ActivityCalendarProps {
  stats: StreakGraceResult;
  getDayDetails: (dateStr: string) => DayActivityDetail;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ stats, getDayDetails }) => {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const { activeDatesSet, graceDatesSet } = stats;

  const daysOfWeek = useMemo(
    () => [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')],
    [t]
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const selectedDayDetail = selectedDateStr ? getDayDetails(selectedDateStr) : null;

  return (
    <View style={[styles.container, Shadows.card]}>
      {/* Month Selector Header */}
      <View style={styles.header}>
        <Pressable style={styles.navButton} onPress={handlePrevMonth}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.monthTitleRow}>
          <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <Pressable style={styles.todayButton} onPress={handleToday}>
            <Text style={styles.todayButtonText}>{t('todayButton')}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.navButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Weekday Header Row */}
      <View style={styles.weekRow}>
        {daysOfWeek.map((dayName, idx) => (
          <Text key={idx} style={styles.weekDayText}>
            {dayName}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {calendarDays.map((day) => {
          const dateStr = toDateString(day);
          const inMonth = isSameMonth(day, currentMonth);
          const dayIsToday = isToday(day);
          const isActive = activeDatesSet.has(dateStr);
          const isGrace = !isActive && graceDatesSet.has(dateStr);

          return (
            <Pressable
              key={dateStr}
              style={[
                styles.dayTile,
                !inMonth && styles.dayTileOtherMonth,
                dayIsToday && styles.dayTileToday,
                isActive && styles.dayTileActive,
                isGrace && styles.dayTileGrace,
              ]}
              onPress={() => setSelectedDateStr(dateStr)}
            >
              <Text
                style={[
                  styles.dayNum,
                  !inMonth && styles.dayNumOtherMonth,
                  dayIsToday && styles.dayNumToday,
                  isActive && styles.dayNumActive,
                  isGrace && styles.dayNumGrace,
                ]}
              >
                {format(day, 'd')}
              </Text>

              {/* Status Icons / Dots */}
              {isActive && (
                <View style={styles.iconContainer}>
                  <Ionicons name="flame" size={14} color="#F97316" />
                </View>
              )}
              {isGrace && (
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-sharp" size={13} color={Colors.work} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend Footer */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="flame" size={12} color="#F97316" />
          </View>
          <Text style={styles.legendText}>{t('activeDayLegend')}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.workBg }]}>
            <Ionicons name="shield-sharp" size={11} color={Colors.work} />
          </View>
          <Text style={styles.legendText}>{t('graceDayLegend')}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.bgTertiary }]} />
          <Text style={styles.legendText}>{t('inactiveDayLegend')}</Text>
        </View>
      </View>

      {/* Day Details Modal */}
      {selectedDateStr && (
        <Modal
          visible={Boolean(selectedDateStr)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDateStr(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSelectedDateStr(null)}>
            <Pressable style={[styles.modalContent, Shadows.elevated]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.work} />
                  <Text style={styles.modalTitle}>
                    {t('dayDetailTitle', { date: selectedDateStr })}
                  </Text>
                </View>
                <Pressable onPress={() => setSelectedDateStr(null)}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {selectedDayDetail && (selectedDayDetail.habitsCompleted.length > 0 || selectedDayDetail.tasksCompleted.length > 0) ? (
                  <View style={styles.activityList}>
                    {selectedDayDetail.habitsCompleted.length > 0 && (
                      <View style={styles.sectionBox}>
                        <Text style={styles.sectionTitle}>{t('completedHabits')}</Text>
                        {selectedDayDetail.habitsCompleted.map((h, i) => (
                          <View key={i} style={styles.activityItem}>
                            <Ionicons name="checkmark-circle" size={18} color={Colors.health} />
                            <Text style={styles.activityName}>{h.name}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {selectedDayDetail.tasksCompleted.length > 0 && (
                      <View style={styles.sectionBox}>
                        <Text style={styles.sectionTitle}>{t('completedTasks')}</Text>
                        {selectedDayDetail.tasksCompleted.map((taskItem, i) => (
                          <View key={i} style={styles.activityItem}>
                            <Ionicons name="checkbox" size={18} color={Colors.work} />
                            <Text style={styles.activityName}>{taskItem.title}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyDetailBox}>
                    <Ionicons name="moon-outline" size={36} color={Colors.textMuted} />
                    <Text style={styles.emptyDetailText}>{t('noActivityOnDate')}</Text>
                    {graceDatesSet.has(selectedDateStr) && (
                      <Text style={styles.graceDetailNotice}>
                        {t('graceProtectedNotice')}
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  navButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.bgTertiary,
  },
  monthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  monthTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  todayButton: {
    backgroundColor: Colors.workBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  todayButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.work,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
    width: '14%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayTile: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  dayTileOtherMonth: {
    opacity: 0.3,
  },
  dayTileToday: {
    borderWidth: 2,
    borderColor: Colors.work,
  },
  dayTileActive: {
    backgroundColor: '#FFEDD5',
  },
  dayTileGrace: {
    backgroundColor: Colors.workBg,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayNumOtherMonth: {
    color: Colors.textMuted,
  },
  dayNumToday: {
    fontWeight: '800',
    color: Colors.work,
  },
  dayNumActive: {
    color: '#C2410C',
    fontWeight: '700',
  },
  dayNumGrace: {
    color: Colors.work,
    fontWeight: '700',
  },
  iconContainer: {
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  modalContent: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modalTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  activityList: {
    gap: Spacing.md,
  },
  sectionBox: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  activityName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyDetailBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyDetailText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  graceDetailNotice: {
    fontSize: 12,
    color: Colors.work,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
