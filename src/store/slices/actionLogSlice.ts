import { createSlice, UnknownAction } from '@reduxjs/toolkit';

const MAX_ENTRIES = 20;

// Todo serializable. Sin timestamps: el reducer debe ser puro, y el id
// incremental basta para ordenar y para usarlo como key en la UI.
export interface LogEntry {
  id: number;
  type: string;
  payload: string;
}

export interface ActionLogState {
  entries: LogEntry[];
  nextId: number;
}

const initialState: ActionLogState = {
  entries: [],
  nextId: 1,
};

// Acciones de los otros slices (sus types empiezan por 'stats/' o 'inventory/')
const isTrackedAction = (action: UnknownAction): action is UnknownAction & { payload?: unknown } =>
  action.type.startsWith('stats/') || action.type.startsWith('inventory/');

const actionLogSlice = createSlice({
  name: 'actionLog',
  initialState,
  reducers: {
    clearLog(state) {
      state.entries = [];
    },
  },
  // 🎥 VIDEO: extraReducers + addMatcher. Este slice "escucha" acciones que
  // pertenecen a OTROS slices. Cada dispatch pasa por TODOS los reducers del
  // store, así que el log se alimenta solo: los componentes nunca despachan
  // nada al log manualmente.
  extraReducers: (builder) => {
    builder.addMatcher(isTrackedAction, (state, action) => {
      state.entries.unshift({
        id: state.nextId,
        type: action.type,
        // JSON.stringify(undefined) devuelve undefined (acciones sin payload)
        payload: JSON.stringify(action.payload) ?? '—',
      });
      state.nextId += 1;
      if (state.entries.length > MAX_ENTRIES) {
        state.entries.length = MAX_ENTRIES;
      }
    });
  },
});

export const { clearLog } = actionLogSlice.actions;

export default actionLogSlice.reducer;
