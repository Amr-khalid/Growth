/**
 * ErrorBoundary — Catches unhandled JS errors to prevent app crashes
 * Wraps the entire app so if any component throws, we show a fallback UI
 * instead of crashing the app.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>حدث خطأ غير متوقع</Text>
            <Text style={styles.subtitle}>Something went wrong</Text>
            <ScrollView style={styles.errorBox} contentContainerStyle={{ padding: 12 }}>
              <Text style={styles.errorText}>
                {this.state.error?.message || 'Unknown error'}
              </Text>
            </ScrollView>
            <Pressable style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>إعادة المحاولة / Try Again</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    maxHeight: 120,
    width: '100%',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
