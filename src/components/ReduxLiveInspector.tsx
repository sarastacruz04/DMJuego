import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { healHero, takeDamage } from '../store/slices/statsSlice';
import {
  selectCombatPower,
  selectIsDefeated,
  selectIsOverencumbered,
  selectRecentLogLines,
  selectTotalStats,
} from '../store/selectors';
import { applyAttack, BOSS_EMOJI, BOSS_MAX_HP, BOSS_NAME, getBossRetaliation } from '../utils/combat';
import ProgressBar from './ui/ProgressBar';
import { colors, hpBarColor, MIN_TOUCH, radius, spacing } from '../theme';

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

// Zona D: arena contra el Boss + consola visual de Redux.
export default function ReduxLiveInspector() {
  const dispatch = useAppDispatch();
  const combatPower = useAppSelector(selectCombatPower);
  const totalStats = useAppSelector(selectTotalStats);
  const isOverloaded = useAppSelector(selectIsOverencumbered);
  const isDefeated = useAppSelector(selectIsDefeated);
  const logLines = useAppSelector(selectRecentLogLines);

  // 🎥 VIDEO: estado LOCAL a propósito. La vida del Boss solo la lee y la
  // modifica este componente: ninguna otra zona la necesita. Subirla a Redux
  // agregaría acciones y ruido al store sin ningún beneficio. Regla práctica:
  // useState para lo que es de un solo componente; Redux para lo compartido.
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  // Estado puramente de UI: plegar la arena en pantallas pequeñas
  const [arenaOpen, setArenaOpen] = useState(true);

  const bossDefeated = bossHp <= 0;
  const canAttack = !isDefeated && !bossDefeated;

  const handleAttack = () => {
    setBossHp(applyAttack(bossHp, combatPower));
    // El Boss contraataca: esto SÍ va al store, porque el HP del héroe lo
    // comparten el avatar, las barras y la consola.
    dispatch(takeDamage(getBossRetaliation(totalStats.agi, isOverloaded)));
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setArenaOpen((open) => !open)} style={styles.arenaHeader}>
        <Text style={styles.title}>
          {BOSS_EMOJI} Arena: {BOSS_NAME}
        </Text>
        <Text style={styles.toggle}>{arenaOpen ? '▼' : '▲'}</Text>
      </Pressable>

      {arenaOpen && (
        <View style={styles.arena}>
          <View style={styles.bossRow}>
            <View style={styles.bossBar}>
              <ProgressBar
                label="Vida del Boss"
                value={bossHp}
                max={BOSS_MAX_HP}
                color={hpBarColor((bossHp / BOSS_MAX_HP) * 100)}
              />
            </View>
            <Text style={styles.power}>⚡ {combatPower}</Text>
          </View>

          {isDefeated && <Text style={styles.statusLose}>💀 Has caído</Text>}
          {!isDefeated && bossDefeated && <Text style={styles.statusWin}>🏆 ¡Victoria!</Text>}

          <View style={styles.buttonRow}>
            <Pressable
              disabled={!canAttack}
              onPress={handleAttack}
              style={({ pressed }) => [styles.button, styles.attack, !canAttack && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>⚔️ Atacar</Text>
            </Pressable>
            <Pressable
              onPress={() => dispatch(healHero())}
              style={({ pressed }) => [styles.button, styles.heal, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>🧪 Curar</Text>
            </Pressable>
            <Pressable
              onPress={() => setBossHp(BOSS_MAX_HP)}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>🔄 Reiniciar</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.console}>
        <Text style={styles.consoleTitle}>{'>'} redux://acciones (últimas 5)</Text>
        {logLines.length === 0 ? (
          <Text style={styles.consoleLine}>Esperando acciones…</Text>
        ) : (
          logLines.map((line, index) => <LogLine key={line.id} text={line.text} latest={index === 0} />)
        )}
      </View>
    </View>
  );
}

// Cada línea nueva se monta con su propia key (id del log) y entra con fade/slide
function LogLine({ text, latest }: { text: string; latest: boolean }) {
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [appear]);

  const translateX = appear.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  return (
    <Animated.Text
      numberOfLines={1}
      style={[styles.consoleLine, latest && styles.consoleLatest, { opacity: appear, transform: [{ translateX }] }]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  arenaHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  toggle: {
    color: colors.textMuted,
    fontSize: 12,
    paddingHorizontal: spacing.sm,
  },
  arena: {
    gap: spacing.xs,
  },
  bossRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  bossBar: {
    flex: 1,
  },
  power: {
    color: colors.gold,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statusLose: {
    color: colors.red,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusWin: {
    color: colors.gold,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: MIN_TOUCH,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attack: {
    backgroundColor: '#991b1b',
    borderColor: colors.red,
  },
  heal: {
    backgroundColor: '#14532d',
    borderColor: colors.green,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  console: {
    backgroundColor: colors.terminalBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#14532d',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    // Altura fija para 5 líneas: la consola no "salta" al llenarse
    minHeight: 6 * 16 + spacing.xs * 2,
  },
  consoleTitle: {
    color: colors.textMuted,
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: 16,
  },
  consoleLine: {
    color: colors.terminalText,
    fontFamily: MONO,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.75,
  },
  consoleLatest: {
    color: '#bbf7d0',
    fontWeight: '700',
  },
});
