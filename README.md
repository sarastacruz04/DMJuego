# ⚔️ HeroForge RPG — Arquitectura de Estado Visual con Redux Toolkit

Mini-juego en React Native (Expo) cuyo objetivo es **ver** el flujo de Redux: cada toque despacha una acción y, en el mismo instante, reaccionan cuatro zonas independientes de la pantalla (avatar, entrenamiento, armería y consola de Redux).

Taller individual · Desarrollo Móvil · Universidad de La Sabana.

## Cómo correrlo

Requisitos: Node 20+ y la app **Expo Go (SDK 58)** en el teléfono.

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go (Android) o con la cámara (iOS). Si el teléfono no está en la misma red que el computador (WSL, redes universitarias), usa `npx expo start --tunnel`.

Typecheck: `npx tsc --noEmit`.

## Stack

- Expo SDK 58 · React Native 0.88 · TypeScript estricto
- `@reduxjs/toolkit` + `react-redux`
- `react-native-safe-area-context` (incluido en Expo Go; reemplaza al `SafeAreaView` de React Native, que está deprecado)
- Sprites = emojis · Animaciones = API `Animated` nativa

## Estructura

```
App.tsx                       Provider + layout (no pasa props a las zonas)
src/
  theme.ts                    paleta, espaciados y colores de barras
  store/
    index.ts                  configureStore, RootState, AppDispatch, hooks tipados
    selectors.ts              TODO el estado derivado (createSelector)
    slices/
      statsSlice.ts           atributos base, puntos y HP
      inventorySlice.ts       catálogo (7 ítems) + equippedIds
      actionLogSlice.ts       historial de acciones (addMatcher)
  components/
    HeroAvatarHUD.tsx         Zona A — avatar, barras, clase, poder (solo lee)
    StatsControlPanel.tsx     Zona B — [-]/[+], presets, reset
    ArmoryGrid.tsx            Zona C — cuadrícula de ítems, sobrecarga
    ReduxLiveInspector.tsx    Zona D — arena vs Boss + consola de Redux
    ui/ProgressBar.tsx        barra animada genérica (único componente con props)
  utils/combat.ts             funciones puras del combate
docs/GUION_VIDEO.md           guion de apoyo para el video
```

## Flujo unidireccional de Redux

```
 ┌──────────────┐  dispatch(toggleEquipItem('armor_cursed'))
 │ ArmoryGrid   │ ─────────────────────────────────────────┐
 └──────────────┘                                          ▼
                                              ┌───────────────────────┐
                                              │        STORE          │
                                              │ inventory reducer:    │
                                              │   equippedIds.push()  │ (Immer → estado nuevo)
                                              │ actionLog addMatcher: │
                                              │   entries.unshift()   │
                                              └───────────┬───────────┘
                                                          │ nuevo state
                                                          ▼
                                              ┌───────────────────────┐
                                              │      SELECTORES       │
                                              │ totalStats, peso,     │
                                              │ sobrecarga, poder,    │
                                              │ clase, log            │
                                              └───────────┬───────────┘
                     ┌──────────────────┬─────────────────┼──────────────────┐
                     ▼                  ▼                 ▼                  ▼
              HeroAvatarHUD    StatsControlPanel     ArmoryGrid    ReduxLiveInspector
              (clase, aura,    (bono "+6 equipo")    (borde, peso,  (poder, nueva línea
               barra de peso)                         banner)        en la consola)
```

## Store

### Slices y reducers

| Slice | Estado | Reducers |
|---|---|---|
| `stats` | `availablePoints: 15, str: 5, agi: 5, int: 5, currentHp: 100` | `incrementStat`, `decrementStat` (mínimo 1), `takeDamage`, `healHero`, `applyBuildPreset` (`WARRIOR`/`MAGE`/`ROGUE`), `resetStats` |
| `inventory` | `catalog: Item[]` (7 ítems), `equippedIds: string[]` | `toggleEquipItem`, `clearEquipment` |
| `actionLog` | `entries: LogEntry[]` (máx. 20), `nextId` | `clearLog` + `extraReducers` con `addMatcher` para `stats/*` e `inventory/*` |

### Selectores (`src/store/selectors.ts`)

| Selector | Qué calcula |
|---|---|
| `selectEquippedItems` | ítems del catálogo cuyo id está equipado |
| `selectEquipmentBonus` | suma de bonos del equipo |
| `selectTotalStats` | base + bonos de equipo |
| `selectTotalWeight` | suma de pesos equipados |
| `selectMaxWeightCapacity` | `10 + STR total × 2` |
| `selectIsOverencumbered` | peso > capacidad |
| `selectWeightRatio` | peso / capacidad (color de la barra) |
| `selectCombatPower` | `STR×3 + AGI×2 + INT×3`, −30 % si hay sobrecarga |
| `selectManaPool` | `20 + INT total × 5` |
| `selectHeroVisualClass` | `{ heroClass, emoji, auraColor }` |
| `selectHeroExpression` | `healthy` / `hurt` / `defeated` según HP |
| `selectEquippedWeaponIcon` | ícono de la primera arma equipada |
| `selectRecentLogEntries` / `selectRecentLogLines` | últimas 5 acciones (y su texto para la consola) |
| `selectHeroComputedStatus` | objeto compuesto equivalente al selector de referencia del enunciado |

Clase del héroe (en orden de prioridad):

1. **Tanque Pesado** 🦾: 2 o más piezas de armadura/escudo y STR ≥ 10
2. **Guerrero Berserker** 🧔: STR ≥ 15
3. **Archimago** 🧙: INT ≥ 15
4. **Asesino Sombrío** 🥷: AGI ≥ 15
5. **Aldeano** 🧑‍🌾: cualquier otro caso

## Decisiones de diseño

**Estado derivado en selectores, nunca en el state.** Los slices guardan solo datos fuente. Si `combatPower` o `isOverloaded` vivieran en un slice, cada reducer que toque stats o equipo tendría que acordarse de recalcularlos, y bastaría un olvido para que la UI se contradiga. Con selectores existe una única fuente de verdad, y `createSelector` memoiza el resultado: solo recalcula si cambian sus entradas y devuelve la misma referencia, así que no provoca re-renders innecesarios.

**La vida del Boss es estado local (`useState`).** Solo la lee y la modifica `ReduxLiveInspector`. Subirla a Redux agregaría acciones y ruido sin ningún beneficio. El HP del héroe sí está en Redux, porque lo comparten el avatar, las barras, la arena y la consola.

**El log se alimenta con `addMatcher`.** Cada acción despachada pasa por los reducers de todos los slices. `actionLogSlice` escucha cualquier acción `stats/*` o `inventory/*` y la registra, así que los componentes nunca escriben en el log y no es posible olvidar registrar una acción. El reducer es puro: no usa timestamps y ordena con un id incremental.

**Cero prop drilling.** `App.tsx` solo monta `<Provider>` y el layout. Las 4 zonas no reciben props y se conectan solas con `useAppSelector` y `useAppDispatch`. El único componente con props es `ProgressBar`, una pieza visual genérica sin conocimiento del store.

**Las fórmulas viven fuera de los componentes.** Las reglas de dominio están en `selectors.ts` y las del combate en `utils/combat.ts`, ambas como funciones puras. Los componentes solo muestran y despachan.
