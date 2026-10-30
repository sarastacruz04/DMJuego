import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Constantes del dominio: se exportan para que selectores y UI usen los mismos números.
export const MAX_HP = 100;
export const BASE_STAT = 5;
export const INITIAL_POINTS = 15;

export type StatKey = 'str' | 'agi' | 'int';
export type BuildPreset = 'WARRIOR' | 'MAGE' | 'ROGUE';

// Solo datos "fuente". Totales, poder, clase, isDefeated o porcentajes
// NO viven aquí: se derivan en selectors.ts.
export interface StatsState {
  availablePoints: number;
  str: number;
  agi: number;
  int: number;
  currentHp: number;
}

const initialState: StatsState = {
  availablePoints: INITIAL_POINTS,
  str: BASE_STAT,
  agi: BASE_STAT,
  int: BASE_STAT,
  currentHp: MAX_HP,
};

// Reparto final de cada preset (5 base + 15 puntos repartidos = 30 en total).
const PRESETS: Record<BuildPreset, Record<StatKey, number>> = {
  WARRIOR: { str: 15, agi: 8, int: 7 },
  MAGE: { str: 7, agi: 8, int: 15 },
  ROGUE: { str: 8, agi: 15, int: 7 },
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // action.payload es la clave del atributo: 'str' | 'agi' | 'int'
    incrementStat(state, action: PayloadAction<StatKey>) {
      if (state.availablePoints <= 0) return;
      state.availablePoints -= 1;
      state[action.payload] += 1;
    },
    decrementStat(state, action: PayloadAction<StatKey>) {
      // Ningún atributo base puede bajar de 1
      if (state[action.payload] <= 1) return;
      state.availablePoints += 1;
      state[action.payload] -= 1;
    },
    takeDamage(state, action: PayloadAction<number>) {
      const damage = action.payload;
      if (!Number.isFinite(damage) || damage <= 0) return;
      state.currentHp = Math.max(0, state.currentHp - damage);
    },
    healHero(state) {
      state.currentHp = MAX_HP;
    },
    // 🎥 VIDEO: un solo dispatch reasigna los 15 puntos y "transforma" toda la UI.
    // Immer: parece que mutamos `state`, pero en realidad escribimos sobre un
    // draft (proxy). Immer compara el draft con el original y genera un objeto
    // NUEVO e inmutable; por eso react-redux detecta el cambio de referencia.
    // action.payload viaja como string: 'WARRIOR' | 'MAGE' | 'ROGUE'.
    applyBuildPreset(state, action: PayloadAction<BuildPreset>) {
      const preset = PRESETS[action.payload];
      state.str = preset.str;
      state.agi = preset.agi;
      state.int = preset.int;
      state.availablePoints = 0;
    },
    resetStats(state) {
      state.str = BASE_STAT;
      state.agi = BASE_STAT;
      state.int = BASE_STAT;
      state.availablePoints = INITIAL_POINTS;
    },
  },
});

export const {
  incrementStat,
  decrementStat,
  takeDamage,
  healHero,
  applyBuildPreset,
  resetStats,
} = statsSlice.actions;

export default statsSlice.reducer;
