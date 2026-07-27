/**
 * CustomTabBar Component — Ultra-modern floating glassmorphic bottom navigation bar
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface TabMeta {
  activeIcon: IoniconsName;
  inactiveIcon: IoniconsName;
  labelKey: string;
  color: string;
  bgTint: string;
}

const TAB_CONFIGS: Record<string, TabMeta> = {
  index: {
    activeIcon: 'grid-sharp',
    inactiveIcon: 'grid-outline',
    labelKey: 'tabDashboard',
    color: '#4F46E5', // Royal Indigo
    bgTint: '#EEF2FF',
  },
  habits: {
    activeIcon: 'flame-sharp',
    inactiveIcon: 'flame-outline',
    labelKey: 'tabHabits',
    color: '#059669', // Emerald
    bgTint: '#ECFDF5',
  },
  tasks: {
    activeIcon: 'checkbox-sharp',
    inactiveIcon: 'checkbox-outline',
    labelKey: 'tabTasks',
    color: '#E11D48', // Coral Rose
    bgTint: '#FFF1F2',
  },
  calendar: {
    activeIcon: 'calendar-sharp',
    inactiveIcon: 'calendar-outline',
    labelKey: 'tabCalendar',
    color: '#D97706', // Warm Amber
    bgTint: '#FEF3C7',
  },
  analytics: {
    activeIcon: 'stats-chart-sharp',
    inactiveIcon: 'stats-chart-outline',
    labelKey: 'tabAnalytics',
    color: '#7C3AED', // Violet
    bgTint: '#F5F3FF',
  },
};

export interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const { t } = useLanguage();

  return (
    <View style={[styles.floatingContainer, Shadows.elevated]}>
      <View style={styles.barInner}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const config = TAB_CONFIGS[route.name] || {
            activeIcon: 'square',
            inactiveIcon: 'square-outline',
            labelKey: route.name,
            color: Colors.work,
            bgTint: '#EEF2FF',
          };

          const label = options.title !== undefined ? options.title : t(config.labelKey as any);

          const onPress = () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (e) {}

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              {isFocused ? (
                /* Focused Active Pill */
                <View style={[styles.activePill, { backgroundColor: config.bgTint }]}>
                  <Ionicons name={config.activeIcon} size={20} color={config.color} />
                  <Text style={[styles.activeLabel, { color: config.color }]} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              ) : (
                /* Inactive Icon */
                <View style={styles.inactivePill}>
                  <Ionicons name={config.inactiveIcon} size={22} color={Colors.textMuted} />
                  <Text style={styles.inactiveLabel} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 1000,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  inactivePill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  inactiveLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
