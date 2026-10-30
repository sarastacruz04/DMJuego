import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store';
import { MAX_HP } from '../store/slices/statsSlice';
import {
  MANA_BAR_SCALE,
  selectCombatPower,
  selectCurrentHp,
  selectEquippedWeaponIcon,
  selectHeroExpression,
  selectHeroVisualClass,
  selectIsOverencumbered,
  selectManaPool,
  selectMaxWeightCapacity,
  selectTotalWeight,
  selectWeightRatio,
} from '../store/selectors';
import type { HeroExpression } from '../store/selectors';
import ProgressBar from './ui/ProgressBar';
import { colors, hpBarColor, radius, spacing, weightBarColor } from '../theme';

const EXPRESSION_ICON: Record<HeroExpression, string> = {
  healthy: '💪',
  hurt: '🤕',
  defeated: '💀',
};

// Zona A: no tiene botones ni recibe props. Solo LEE selectores y reacciona en vivo.
export default function HeroAvatarHUD() {
  const { heroClass, emoji, auraColor } = useAppSelector(selectHeroVisualClass);
  const expression = useAppSelector(selectHeroExpression);
  const weaponIcon = useAppSelector(selectEquippedWeaponIcon);
  const isOverloaded = useAppSelector(selectIsOverencumbered);
  const currentHp = useAppSelector(selectCurrentHp);
  const mana = useAppSelector(selectManaPool);
  const weight = useAppSelector(selectTotalWeight);
  const capacity = useAppSelector(selectMaxWeightCapacity);
  const weightRatio = useAppSelector(selectWeightRatio);
  const combatPower = useAppSelector(selectCombatPower);

  const isDefeated = expression === 'defeated';

  // Pequeño "pulso" del avatar cada vez que cambia su clase
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    pulse.setValue(1.15);
    Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [heroClass, pulse]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarColumn}>
        <Animated.View
          style={[
            styles.avatar,
            { borderColor: auraColor, shadowColor: auraColor, transform: [{ scale: pulse }] },
            isDefeated && styles.avatarDefeated,
          ]}
        >
          <Text style={styles.avatarEmoji}>{isDefeated ? '💀' : emoji}</Text>
          {weaponIcon && !isDefeated && (
            <View style={styles.weaponBadge}>
              <Text style={styles.badgeEmoji}>{weaponIcon}</Text>
            </View>
          )}
          <View style={styles.expressionBadge}>
            <Text style={styles.badgeEmoji}>{EXPRESSION_ICON[expression]}</Text>
          </View>
          {isOverloaded && (
            <View style={styles.overloadBadge}>
              <Text style={styles.badgeEmoji}>😓</Text>
            </View>
          )}
        </Animated.View>
      </View>

      <View style={styles.infoColumn}>
        <View style={styles.topRow}>
          <View style={[styles.classBadge, { backgroundColor: auraColor }]}>
            <Text style={styles.classText} numberOfLines={1}>
              {heroClass}
            </Text>
          </View>
          <Text style={styles.power}>⚡ {combatPower}</Text>
        </View>
        <ProgressBar label="❤️ Vida" value={currentHp} max={MAX_HP} color={hpBarColor(currentHp)} />
        <ProgressBar label="🔷 Maná" value={mana} max={MANA_BAR_SCALE} color={colors.mana} valueText={`${mana}`} />
        <ProgressBar
          label="🎒 Carga"
          value={weight}
          max={capacity}
          color={weightBarColor(weightRatio)}
          valueText={`${weight} / ${capacity} kg`}
        />
      </View>
    </View>
  );
}

const AVATAR_SIZE = 76;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  avatarColumn: {
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  avatarDefeated: {
    opacity: 0.4,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  weaponBadge: {
    position: 'absolute',
    right: -6,
    bottom: -2,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 2,
  },
  expressionBadge: {
    position: 'absolute',
    left: -6,
    bottom: -2,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 2,
  },
  overloadBadge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 2,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  classBadge: {
    flexShrink: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.lg,
  },
  classText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 12,
  },
  power: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
});
