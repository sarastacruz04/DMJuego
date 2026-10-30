import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  applyBuildPreset,
  BuildPreset,
  decrementStat,
  incrementStat,
  resetStats,
  StatKey,
} from '../store/slices/statsSlice';
import { selectEquipmentBonus, selectStats } from '../store/selectors';
import ProgressBar from './ui/ProgressBar';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

const STAT_BAR_MAX = 20;

const STAT_ROWS: { key: StatKey; label: string; color: string }[] = [
  { key: 'str', label: 'Fuerza (STR)', color: '#ef4444' },
  { key: 'agi', label: 'Agilidad (AGI)', color: '#10b981' },
  { key: 'int', label: 'Inteligencia (INT)', color: '#3b82f6' },
];

const PRESET_BUTTONS: { preset: BuildPreset; label: string }[] = [
  { preset: 'WARRIOR', label: '⚔️ Build Tanque' },
  { preset: 'MAGE', label: '🔮 Build Mago' },
  { preset: 'ROGUE', label: '🗡️ Build Pícaro' },
];

// 🎥 VIDEO: patrón de toda zona. LEE con useAppSelector y DESPACHA con
// useAppDispatch; no recibe props y no contiene fórmulas de dominio.
export default function StatsControlPanel() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectStats);
  const bonus = useAppSelector(selectEquipmentBonus);

  const canIncrement = stats.availablePoints > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🏋️ Entrenamiento</Text>
        <View style={styles.pointsPill}>
          <Text style={styles.pointsText}>Puntos disponibles: {stats.availablePoints}</Text>
        </View>
      </View>

      {STAT_ROWS.map(({ key, label, color }) => {
        const base = stats[key];
        const canDecrement = base > 1;
        return (
          <View key={key} style={styles.statRow}>
            <Pressable
              accessibilityLabel={`Bajar ${label}`}
              disabled={!canDecrement}
              onPress={() => dispatch(decrementStat(key))}
              style={({ pressed }) => [styles.stepButton, !canDecrement && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>

            <View style={styles.statBody}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>
                  {base}
                  {bonus[key] !== 0 && (
                    <Text style={bonus[key] > 0 ? styles.bonusPositive : styles.bonusNegative}>
                      {'  '}
                      {bonus[key] > 0 ? '+' : ''}
                      {bonus[key]} equipo
                    </Text>
                  )}
                </Text>
              </View>
              <ProgressBar value={base} max={STAT_BAR_MAX} color={color} height={10} />
            </View>

            <Pressable
              accessibilityLabel={`Subir ${label}`}
              disabled={!canIncrement}
              onPress={() => dispatch(incrementStat(key))}
              style={({ pressed }) => [styles.stepButton, !canIncrement && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.presetRow}>
        {PRESET_BUTTONS.map(({ preset, label }) => (
          <Pressable
            key={preset}
            onPress={() => dispatch(applyBuildPreset(preset))}
            style={({ pressed }) => [styles.presetButton, pressed && styles.pressed]}
          >
            <Text style={styles.presetText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => dispatch(resetStats())}
        style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
      >
        <Text style={styles.resetText}>🧪 Poción de Reseteo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  pointsPill: {
    backgroundColor: colors.background,
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pointsText: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statBody: {
    flex: 1,
    gap: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  bonusPositive: {
    color: colors.green,
    fontSize: 11,
  },
  bonusNegative: {
    color: colors.red,
    fontSize: 11,
  },
  stepButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  presetButton: {
    flex: 1,
    minHeight: MIN_TOUCH,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  presetText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  resetButton: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.sm,
    backgroundColor: '#581c87',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    color: colors.text,
    fontWeight: '700',
  },
});
