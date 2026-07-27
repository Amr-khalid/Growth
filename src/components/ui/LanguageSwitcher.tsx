/**
 * LanguageSwitcher Component — Sleek Toggle Button (Arabic ↔ English)
 */

import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/theme';

export const LanguageSwitcher: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        Shadows.card,
      ]}
      onPress={toggleLanguage}
    >
      <Ionicons name="globe-outline" size={16} color={Colors.work} />
      <Text style={styles.text}>
        {language === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {language === 'ar' ? 'EN' : 'AR'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  text: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.workBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.work,
  },
});
