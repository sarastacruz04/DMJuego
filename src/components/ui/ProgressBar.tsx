import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  label?: string;
  valueText?: string;
  height?: number;
}

// Barra genérica: es el ÚNICO componente que recibe props, porque es una pieza
// visual reutilizable sin conocimiento del store.
export default function ProgressBar({ value, max, color, label, valueText, height = 8 }: ProgressBarProps) {
  // Se limita visualmente al 100% aunque el valor real lo supere
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const progress = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 300,
      useNativeDriver: false, // anima width, que el driver nativo no soporta
    }).start();
  }, [ratio, progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      {(label || valueText) && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{valueText ?? `${value}/${max}`}</Text>
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color, borderRadius: height / 2 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  track: {
    width: '100%',
    backgroundColor: colors.border,
    overflow: 'hidden',
    borderRadius: radius.sm,
  },
  fill: {
    height: '100%',
  },
});
