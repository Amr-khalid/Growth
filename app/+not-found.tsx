/**
 * Not Found Screen — 404 fallback
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../src/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="compass-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>This screen doesn't exist.</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing['2xl'],
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  button: {
    backgroundColor: Colors.work,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.base,
  },
  buttonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
});
