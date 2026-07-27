/**
 * ProgressRing Component — Smooth SVG circular progress indicator
 * Clean cross-platform implementation without DOM warnings
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors, Typography } from '../../constants/theme';

interface ProgressRingProps {
  progress: number;      // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  color = Colors.work,
  showLabel = true,
  label,
  children,
}: ProgressRingProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    let animationFrame: number;
    const target = Math.min(Math.max(progress, 0), 100);
    const start = displayProgress;
    const startTime = Date.now();
    const duration = 600;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const current = start + (target - start) * eased;

      setDisplayProgress(current);

      if (progressRatio < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [progress]);

  const strokeDashoffset = circumference * (1 - displayProgress / 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.bgTertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle rotated -90 deg via SVG group transform */}
        <G transform={`rotate(-90 ${center} ${center})`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      <View style={styles.labelContainer}>
        {children ? (
          children
        ) : showLabel ? (
          <>
            <Text style={[styles.value, { color }]}>{Math.round(displayProgress)}%</Text>
            {label && <Text style={styles.label} numberOfLines={1}>{label}</Text>}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 1,
    maxWidth: 50,
    textAlign: 'center',
  },
});
