/**
 * HeatmapGrid Component — Activity contribution heatmap tuned for light theme
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { getLastNDays, format, parseISO } from '../../utils/dateHelpers';
import { CATEGORIES } from '../../constants/categories';
import type { LifeCategory } from '../../types';

interface HeatmapGridProps {
  completionDates: string[];    // Array of YYYY-MM-DD strings
  category: LifeCategory;
  days?: number;                // Number of days to show (default 91 = 13 weeks)
}

export function HeatmapGrid({
  completionDates,
  category,
  days = 91,
}: HeatmapGridProps) {
  const accentColor = CATEGORIES[category].color;
  const dateSet = new Set(completionDates);
  const allDays = getLastNDays(days);

  // Calculate grid dimensions
  const cellSize = 12;
  const cellGap = 3;
  const cellStep = cellSize + cellGap;
  const numWeeks = Math.ceil(days / 7);
  const gridWidth = numWeeks * cellStep;
  const gridHeight = 7 * cellStep;

  // Group days into weeks
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  const firstDayOfWeek = parseISO(allDays[0]).getDay(); // 0=Sun
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push('');
  }

  for (const day of allDays) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getColor = (dateStr: string): string => {
    if (!dateStr) return 'transparent';
    if (dateSet.has(dateStr)) return accentColor;
    return Colors.heatmapEmpty; // #E2E8F0 soft grey
  };

  const getOpacity = (dateStr: string): number => {
    if (!dateStr) return 0;
    return 1;
  };

  // Month labels
  const monthLabels: { text: string; x: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    for (const day of week) {
      if (day) {
        const date = parseISO(day);
        const month = date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            text: format(date, 'MMM'),
            x: weekIndex * cellStep,
          });
          lastMonth = month;
        }
        break;
      }
    }
  });

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((label, i) => (
            <Text key={i} style={[styles.dayLabel, { height: cellStep }]}>
              {label}
            </Text>
          ))}
        </View>

        <View>
          {/* Month labels */}
          <View style={[styles.monthLabels, { width: gridWidth }]}>
            {monthLabels.map((m, i) => (
              <Text
                key={i}
                style={[styles.monthLabel, { position: 'absolute', left: m.x }]}
              >
                {m.text}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <Svg width={gridWidth} height={gridHeight}>
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <Rect
                  key={`${weekIndex}-${dayIndex}`}
                  x={weekIndex * cellStep}
                  y={dayIndex * cellStep}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  ry={3}
                  fill={getColor(day)}
                  opacity={getOpacity(day)}
                />
              ))
            )}
          </Svg>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={[styles.legendCell, { backgroundColor: Colors.heatmapEmpty }]} />
        <View style={[styles.legendCell, { backgroundColor: accentColor, opacity: 0.35 }]} />
        <View style={[styles.legendCell, { backgroundColor: accentColor, opacity: 0.7 }]} />
        <View style={[styles.legendCell, { backgroundColor: accentColor }]} />
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: Spacing.xs,
    marginTop: 18,
  },
  dayLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    fontSize: 9,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  monthLabels: {
    height: 16,
    position: 'relative',
    marginBottom: 2,
  },
  monthLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    fontSize: 9,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    gap: 3,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    ...Typography.small,
    color: Colors.textMuted,
    fontSize: 9,
    marginHorizontal: 2,
  },
});
