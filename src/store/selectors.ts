import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { toggleEquipItem } from './slices/inventorySlice';

// ─────────────────────────────────────────────────────────────────────────────
// REGLA DE ORO: ESTADO DERIVADO
// Los slices guardan solo datos "fuente" (atributos base, HP, ids equipados).
// Todo lo que se puede CALCULAR a partir de ellos (totales, peso, sobrecarga,
// poder, clase...) se deriva aquí. Si lo guardáramos en el state tendríamos
// que acordarnos de actualizarlo en cada reducer que lo afecte; un olvido y la
// UI muestra datos contradictorios. Con selectores hay UNA única fuente de
// verdad y los valores derivados nunca se desincronizan.
//
// createSelector memoiza: solo recalcula si cambian sus entradas, y devuelve la
// MISMA referencia si no cambiaron. Así useAppSelector no provoca re-renders
// innecesarios al devolver objetos o arrays.
// ─────────────────────────────────────────────────────────────────────────────

export type HeroExpression = 'healthy' | 'hurt' | 'defeated';

export interface HeroVisualClass {
  heroClass: string;
  emoji: string;
  auraColor: string;
}

const RECENT_LOG_SIZE = 5;

// Escala visual de la barra de maná (con INT 15 + equipo mágico ≈ 145-175)
export const MANA_BAR_SCALE = 200;

// ── Selectores base (lectura directa del state) ─────────────────────────────
export const selectStats = (state: RootState) => state.stats;
export const selectCurrentHp = (state: RootState) => state.stats.currentHp;
export const selectCatalog = (state: RootState) => state.inventory.catalog;
export const selectEquippedIds = (state: RootState) => state.inventory.equippedIds;
export const selectActionLogEntries = (state: RootState) => state.actionLog.entries;

// ── Selectores derivados ────────────────────────────────────────────────────
export const selectEquippedItems = createSelector(
  [selectCatalog, selectEquippedIds],
  (catalog, equippedIds) => catalog.filter((item) => equippedIds.includes(item.id)),
);

// Suma de bonos de todo el equipo (Zona B la muestra como "+N equipo")
export const selectEquipmentBonus = createSelector([selectEquippedItems], (items) => ({
  str: items.reduce((acc, i) => acc + i.bonusStr, 0),
  agi: items.reduce((acc, i) => acc + i.bonusAgi, 0),
  int: items.reduce((acc, i) => acc + i.bonusInt, 0),
}));

// 🎥 VIDEO: cruza DOS slices (stats + inventory). Si STR total estuviera
// guardado, equipar un ítem obligaría a tocar también statsSlice.
export const selectTotalStats = createSelector(
  [selectStats, selectEquipmentBonus],
  (stats, bonus) => ({
    str: stats.str + bonus.str,
    agi: stats.agi + bonus.agi,
    int: stats.int + bonus.int,
  }),
);

export const selectTotalWeight = createSelector([selectEquippedItems], (items) =>
  items.reduce((acc, i) => acc + i.weight, 0),
);

// La capacidad depende de la Fuerza TOTAL (base + equipo)
export const selectMaxWeightCapacity = createSelector(
  [selectTotalStats],
  (total) => 10 + total.str * 2,
);

// 🎥 VIDEO: la sobrecarga NO es un booleano guardado; es una comparación que se
// recalcula sola cuando cambia el peso (inventory) o la fuerza (stats).
export const selectIsOverencumbered = createSelector(
  [selectTotalWeight, selectMaxWeightCapacity],
  (weight, capacity) => weight > capacity,
);

export const selectWeightRatio = createSelector(
  [selectTotalWeight, selectMaxWeightCapacity],
  (weight, capacity) => weight / capacity,
);

// 🎥 VIDEO: el Poder de Combate depende de stats, ítems y sobrecarga a la vez.
// Guardarlo sería duplicar información que ya existe en tres sitios.
export const selectCombatPower = createSelector(
  [selectTotalStats, selectIsOverencumbered],
  (total, isOverloaded) => {
    const rawPower = total.str * 3 + total.agi * 2 + total.int * 3;
    return isOverloaded ? Math.round(rawPower * 0.7) : rawPower;
  },
);

export const selectManaPool = createSelector([selectTotalStats], (total) => 20 + total.int * 5);

// 🎥 VIDEO: la clase del héroe es pura presentación derivada de stats + ítems.
export const selectHeroVisualClass = createSelector(
  [selectTotalStats, selectEquippedItems],
  (total, items): HeroVisualClass => {
    const heavyPieces = items.filter(
      (i) => i.category === 'armor' || i.category === 'shield',
    ).length;

    if (heavyPieces >= 2 && total.str >= 10) {
      return { heroClass: 'Tanque Pesado', emoji: '🦾', auraColor: '#f59e0b' };
    }
    if (total.str >= 15) {
      return { heroClass: 'Guerrero Berserker', emoji: '🧔', auraColor: '#ef4444' };
    }
    if (total.int >= 15) {
      return { heroClass: 'Archimago', emoji: '🧙', auraColor: '#3b82f6' };
    }
    if (total.agi >= 15) {
      return { heroClass: 'Asesino Sombrío', emoji: '🥷', auraColor: '#10b981' };
    }
    return { heroClass: 'Aldeano', emoji: '🧑‍🌾', auraColor: '#94a3b8' };
  },
);

export const selectHeroExpression = (state: RootState): HeroExpression => {
  const hp = state.stats.currentHp;
  if (hp <= 0) return 'defeated';
  if (hp <= 60) return 'hurt';
  return 'healthy';
};

export const selectIsDefeated = (state: RootState) => state.stats.currentHp <= 0;

export const selectEquippedWeaponIcon = createSelector(
  [selectEquippedItems],
  (items) => items.find((i) => i.category === 'weapon')?.icon ?? null,
);

export const selectRecentLogEntries = createSelector([selectActionLogEntries], (entries) =>
  entries.slice(0, RECENT_LOG_SIZE),
);

// Líneas listas para la consola. El log guarda el payload crudo (el id del
// ítem); aquí, solo al MOSTRARLO, se traduce a su nombre usando el catálogo.
export const selectRecentLogLines = createSelector(
  [selectRecentLogEntries, selectCatalog],
  (entries, catalog) =>
    entries.map((entry) => {
      let payload = entry.payload;
      if (entry.type === toggleEquipItem.type) {
        const id: unknown = JSON.parse(entry.payload);
        const item = catalog.find((i) => i.id === id);
        if (item) payload = JSON.stringify(item.name);
      }
      return { id: entry.id, text: `[${entry.type}] -> ${payload}` };
    }),
);

// 🎥 VIDEO: equivalente memoizado al selector de referencia del enunciado,
// compuesto a partir de los selectores anteriores (sin repetir fórmulas).
export const selectHeroComputedStatus = createSelector(
  [
    selectTotalStats,
    selectTotalWeight,
    selectMaxWeightCapacity,
    selectIsOverencumbered,
    selectHeroVisualClass,
    selectCombatPower,
    selectIsDefeated,
  ],
  (total, currentWeight, maxWeightCapacity, isOverloaded, visual, combatPower, isDefeated) => ({
    totalStr: total.str,
    totalAgi: total.agi,
    totalInt: total.int,
    currentWeight,
    maxWeightCapacity,
    isOverloaded,
    heroClass: visual.heroClass,
    auraColor: visual.auraColor,
    combatPower,
    isDefeated,
  }),
);
