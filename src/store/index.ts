import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import statsReducer from './slices/statsSlice';
import inventoryReducer from './slices/inventorySlice';
import actionLogReducer from './slices/actionLogSlice';

// 🎥 VIDEO: configureStore combina los 3 slices en un único árbol de estado:
//   { stats, inventory, actionLog }
// Además activa por defecto Redux DevTools, el middleware de thunk y los
// chequeos de inmutabilidad y serialización en desarrollo.
export const store = configureStore({
  reducer: {
    stats: statsReducer,
    inventory: inventoryReducer,
    actionLog: actionLogReducer,
  },
});

// Tipos inferidos del propio store: si se agrega un slice, se actualizan solos.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados para usar en los componentes visuales
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
