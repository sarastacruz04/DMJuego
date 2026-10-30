import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ItemCategory = 'weapon' | 'shield' | 'armor' | 'boots' | 'accessory';

export interface Item {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  weight: number; // kg
}

// Guardamos solo los ids equipados (no copias de los ítems): una única fuente
// de verdad para los datos de cada ítem, que es el catálogo.
export interface InventoryState {
  catalog: Item[];
  equippedIds: string[];
}

const CATALOG: Item[] = [
  { id: 'sword_fire', name: 'Espada de Fuego', icon: '🔥', category: 'weapon', bonusStr: 5, bonusAgi: 0, bonusInt: 1, weight: 8 },
  { id: 'shield_titan', name: 'Escudo de Titanio', icon: '🛡️', category: 'shield', bonusStr: 2, bonusAgi: 3, bonusInt: 0, weight: 15 },
  { id: 'staff_arcane', name: 'Báculo Arcano', icon: '🪄', category: 'weapon', bonusStr: 0, bonusAgi: 0, bonusInt: 7, weight: 5 },
  { id: 'boots_elven', name: 'Botas Élficas', icon: '👢', category: 'boots', bonusStr: 0, bonusAgi: 5, bonusInt: 0, weight: 2 },
  { id: 'armor_cursed', name: 'Armadura Maldita', icon: '🦇', category: 'armor', bonusStr: 6, bonusAgi: -2, bonusInt: -1, weight: 25 },
  { id: 'dagger_shadow', name: 'Daga de Sombras', icon: '🗡️', category: 'weapon', bonusStr: 1, bonusAgi: 5, bonusInt: 0, weight: 3 },
  { id: 'amulet_sage', name: 'Amuleto del Sabio', icon: '📿', category: 'accessory', bonusStr: 0, bonusAgi: 1, bonusInt: 3, weight: 1 },
];

const initialState: InventoryState = {
  catalog: CATALOG,
  equippedIds: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // 🎥 VIDEO: action.payload es solo el id del ítem (ej. 'sword_fire').
    // Con Immer usamos push/splice "mutables" sobre el draft; RTK devuelve
    // un estado nuevo sin que tengamos que copiar arrays a mano con spread.
    toggleEquipItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.catalog.some((item) => item.id === id)) return;
      const index = state.equippedIds.indexOf(id);
      if (index >= 0) {
        state.equippedIds.splice(index, 1);
      } else {
        state.equippedIds.push(id);
      }
    },
    clearEquipment(state) {
      state.equippedIds = [];
    },
  },
});

export const { toggleEquipItem, clearEquipment } = inventorySlice.actions;

export default inventorySlice.reducer;
