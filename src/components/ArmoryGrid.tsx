import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { clearEquipment, toggleEquipItem } from '../store/slices/inventorySlice';
import type { Item, ItemCategory } from '../store/slices/inventorySlice';
import {
  selectCatalog,
  selectEquippedIds,
  selectIsOverencumbered,
  selectMaxWeightCapacity,
  selectTotalWeight,
} from '../store/selectors';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  weapon: 'Arma',
  shield: 'Escudo',
  armor: 'Armadura',
  boots: 'Botas',
  accessory: 'Accesorio',
};

// Etiquetas visuales de cada bono, en el orden en que se muestran
const BONUS_LABELS: { key: 'bonusStr' | 'bonusAgi' | 'bonusInt'; label: string }[] = [
  { key: 'bonusStr', label: 'Ataque' },
  { key: 'bonusAgi', label: 'Defensa' },
  { key: 'bonusInt', label: 'Magia' },
];

// Zona C: despacha a inventorySlice. NO escribe en el log: actionLogSlice lo
// captura solo con addMatcher.
export default function ArmoryGrid() {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector(selectCatalog);
  const equippedIds = useAppSelector(selectEquippedIds);
  const weight = useAppSelector(selectTotalWeight);
  const capacity = useAppSelector(selectMaxWeightCapacity);
  const isOverloaded = useAppSelector(selectIsOverencumbered);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🛡️ Armería & Mochila</Text>
          <Text style={[styles.weightText, isOverloaded && styles.weightOver]}>
            Peso: {weight} / {capacity} kg
          </Text>
        </View>
        <Pressable
          disabled={equippedIds.length === 0}
          onPress={() => dispatch(clearEquipment())}
          style={({ pressed }) => [
            styles.clearButton,
            equippedIds.length === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.clearText}>Desequipar todo</Text>
        </Pressable>
      </View>

      {isOverloaded && (
        <View style={styles.overloadBanner}>
          <Text style={styles.overloadText}>⚠️ ¡SOBRECARGADO! (-50% Velocidad)</Text>
        </View>
      )}

      <View style={styles.grid}>
        {catalog.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            equipped={equippedIds.includes(item.id)}
            onPress={() => dispatch(toggleEquipItem(item.id))}
          />
        ))}
      </View>
    </View>
  );
}

// Subcomponente local de presentación (no es una de las 4 zonas)
function ItemCard({ item, equipped, onPress }: { item: Item; equipped: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: equipped }}
      style={({ pressed }) => [styles.itemCard, equipped && styles.itemEquipped, pressed && styles.pressed]}
    >
      {equipped && (
        <View style={styles.equippedTag}>
          <Text style={styles.equippedTagText}>EQUIPADO</Text>
        </View>
      )}
      <Text style={styles.itemIcon}>{item.icon}</Text>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.itemCategory}>{CATEGORY_LABEL[item.category]}</Text>
      <View style={styles.bonusList}>
        {BONUS_LABELS.filter(({ key }) => item[key] !== 0).map(({ key, label }) => (
          <Text key={key} style={[styles.bonus, item[key] < 0 && styles.bonusNegative]}>
            {item[key] > 0 ? '+' : ''}
            {item[key]} {label}
          </Text>
        ))}
      </View>
      <Text style={styles.itemWeight}>⚖️ {item.weight} kg</Text>
    </Pressable>
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
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  weightText: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  weightOver: {
    color: colors.red,
    fontWeight: '700',
  },
  clearButton: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  clearText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  overloadBanner: {
    backgroundColor: '#7f1d1d',
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  overloadText: {
    color: '#fecaca',
    fontWeight: '800',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  itemCard: {
    width: '48.5%',
    minHeight: 132,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
  },
  itemEquipped: {
    borderColor: colors.equippedGlow,
    shadowColor: colors.equippedGlow,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  equippedTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.equippedGlow,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  equippedTagText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: '900',
  },
  itemIcon: {
    fontSize: 30,
    marginTop: 4,
  },
  itemName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
  },
  itemCategory: {
    color: colors.textMuted,
    fontSize: 11,
  },
  bonusList: {
    marginTop: 4,
    alignItems: 'center',
  },
  bonus: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '600',
  },
  bonusNegative: {
    color: colors.red,
  },
  itemWeight: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 'auto',
  },
});
