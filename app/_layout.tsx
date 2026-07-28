/**
 * Root Layout — App entry point with light theme and screen definitions
 */

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, LogBox, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { Colors } from '../src/constants/theme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore splash screen prevent error on native */
});

// Suppress non-critical warnings that can cause noise in production
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate`',
]);

import { LanguageProvider } from '../src/context/LanguageContext';
import { CustomAlertProvider } from '../src/context/CustomAlertContext';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Mobile viewport fit cover & anti-zoom reset
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    document.head.appendChild(meta);
  }
  meta.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  );

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    * {
      box-sizing: border-box !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    html, body {
      height: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      background-color: ${Colors.bgPrimary} !important;
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
    }
    #root, [data-reactroot] {
      height: 100% !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      flex: 1 !important;
      overflow-y: auto;
    }
  `;
  document.head.appendChild(styleEl);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.warn('Font load error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <LanguageProvider>
          <CustomAlertProvider>
            <View style={styles.container}>
              <StatusBar style="dark" />
              {Platform.OS === 'android' && <RNStatusBar translucent backgroundColor="transparent" />}
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.bgPrimary },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="habit/new"
                  options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen
                  name="task/new"
                  options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                  }}
                />
                <Stack.Screen
                  name="habit/[id]"
                  options={{
                    animation: 'slide_from_right',
                  }}
                />
              </Stack>
            </View>
          </CustomAlertProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    width: '100%',
    height: '100%',
  },
});
 // Optimized font loading
