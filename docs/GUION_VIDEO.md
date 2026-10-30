# 🎥 Guion de apoyo — Video HeroForge RPG (5–7 min)

> Son ideas clave, no un libreto. En el código, busca `🎥 VIDEO:` (Ctrl+Shift+F) para encontrar cada punto que vas a mostrar.

**Preparación:** pantalla dividida con VS Code a un lado y el teléfono o emulador al otro. App recién abierta (estado inicial). Pestañas abiertas de antemano: `src/store/index.ts`, `statsSlice.ts`, `inventorySlice.ts`, `actionLogSlice.ts`, `selectors.ts` y `ReduxLiveInspector.tsx`.

---

## 0:00 – 1:30 · El problema arquitectónico

**En pantalla:** la app corriendo. Señala las 4 zonas con el cursor o el dedo.

- Presenta las zonas: **A** Avatar/HUD arriba, **B** Entrenamiento, **C** Armería, **D** Arena + Consola abajo.
- La pregunta: *¿qué pasaría si las conectáramos solo con `useState` y props?*
  - El estado tendría que vivir en el ancestro común (`App`), y cada valor y función bajaría por props a través de componentes que no lo usan: **prop drilling**.
  - Equipar un ítem en C tiene que cambiar el avatar en A, el bono en B y el poder y el log en D. Todo pasaría por `App`, y `App` se volvería un "dios" que lo sabe todo.
  - La tentación es guardar copias (`totalStr` en un lado, `isOverloaded` en otro). Tarde o temprano se **desincronizan** y la UI se contradice.
- El ciclo de Redux (dilo mientras lo dibujas con el cursor):
  **UI → `dispatch(action)` → reducer (en el Store) → nuevo state → selector → re-render**
  - Es unidireccional: los componentes nunca se hablan entre sí; todos hablan con el Store.

## 1:30 – 3:30 · Efecto dominó (demo en vivo)

En cada paso: toca **una sola vez** y recorre con la mirada A → B → C → D.

| # | Acción | Qué cambia (valores reales) | Consola |
|---|---|---|---|
| 1 | Estado inicial | Aldeano 🧑‍🌾 aura gris · ⚡40 · 15 puntos · Carga 0/20 kg · "Esperando acciones…" | — |
| 2 | **🔮 Build Mago** | Puntos 15 → 0 · INT 15 · clase **Archimago** 🧙 aura azul · ⚡82 · Maná 45 → 95 · Carga 0/24 | `[stats/applyBuildPreset] -> "MAGE"` |
| 3 | Equipar **Báculo Arcano** | Borde dorado y "EQUIPADO" · 🪄 junto al avatar · INT "+7 equipo" · ⚡103 · Maná 130 · Carga 5/24 | `[inventory/toggleEquipItem] -> "Báculo Arcano"` |
| 4a | Equipar **Armadura Maldita** | STR "+6 equipo", AGI e INT en rojo · Carga 30/36 (amarilla) · ⚡114 | `... -> "Armadura Maldita"` |
| 4b | Equipar **Escudo de Titanio** | **SOBRECARGA**: Carga 45/40 roja · banner "¡SOBRECARGADO! (-50% Velocidad)" · 😓 en el avatar · clase **Tanque Pesado** 🦾 aura naranja · ⚡ baja a **88** (−30 %) | `... -> "Escudo de Titanio"` |
| 5 | **Desequipar todo** | Vuelve Archimago azul · ⚡82 · Carga 0/24 · desaparece el banner | `[inventory/clearEquipment] -> —` |
| 6 | **⚔️ Atacar** ×2 | Boss 150 → 68 → 0 (🏆 ¡Victoria!) · el Boss contraataca 26 por golpe: HP 100 → 74 → **48** · barra amarilla · expresión 🤕 | `[stats/takeDamage] -> 26` |
| 6b | **🔄 Reiniciar** y atacar ×2 | HP 48 → 22 (rojo) → **0** · avatar 💀 semitransparente · "💀 Has caído" · ataque deshabilitado | `[stats/takeDamage] -> 26` |
| 7 | **🧪 Curar** | HP 100 verde · vuelve el 🧙 · 💪 | `[stats/healHero] -> —` |

Ideas para narrar:
- Paso 4b es el momento estrella: **un solo dispatch** cambió la barra de peso, el banner, la clase, el color del aura y el poder, y registró la acción.
- Nadie guardó "sobrecargado = true". El selector lo **dedujo** del peso (inventory) y de la fuerza (stats).
- "Reiniciar" no aparece en la consola, porque la vida del Boss es `useState` local y no pasa por Redux. Es una buena prueba de que el log es exactamente lo que viaja por el Store.

## 3:30 – 5:30 · Recorrido por el código

1. **`src/store/index.ts`**: `configureStore` con los 3 slices → el árbol `{ stats, inventory, actionLog }`. `RootState` y `AppDispatch` se **infieren** del store. Los hooks `useAppSelector` y `useAppDispatch` están tipados.
2. **Un reducer: `applyBuildPreset`** (`statsSlice.ts`) o **`toggleEquipItem`** (`inventorySlice.ts`)
   - `createSlice` genera solo el action creator. `applyBuildPreset('MAGE')` produce `{ type: 'stats/applyBuildPreset', payload: 'MAGE' }`.
   - **Immer:** `state.str = 7` *parece* una mutación, pero `state` es un **draft** (un Proxy). Immer registra los cambios y produce un objeto **nuevo e inmutable**. Como cambia la referencia, react-redux sabe que hay que re-renderizar.
   - El `payload` es lo mínimo necesario: un string (`'MAGE'` o el id `'armor_cursed'`), nunca el objeto completo.
3. **`actionLogSlice.ts`**: `extraReducers` + `builder.addMatcher`. Toda acción pasa por **todos** los reducers. Este slice escucha `stats/*` e `inventory/*` y se llena solo. Es puro: sin `Date.now()`, con un id incremental.
4. **`selectors.ts`**: el punto clave de la rúbrica.
   - `selectTotalStats` cruza dos slices.
   - `selectIsOverencumbered` y `selectCombatPower` son **derivados**. Si se guardaran, cada reducer que toque stats o equipo tendría que actualizarlos, y un olvido produce una UI contradictoria. Aquí hay una única fuente de verdad.
   - `createSelector` memoiza: solo recalcula si cambian sus entradas y devuelve la misma referencia, lo que evita re-renders.
5. (Si queda tiempo) **`ReduxLiveInspector.tsx`**: `useState` para la vida del Boss y `dispatch(takeDamage(...))` para el HP del héroe. Ahí se ve el contraste local vs. global en un mismo componente.

## 5:30 – 6:30 · Conclusión: ¿useState o Redux Toolkit?

Criterios (con ejemplo real de cada uno):
- **Alcance del dato:** si solo lo usa un componente → `useState`. Ejemplos: un input de búsqueda, un modal abierto, la vida del Boss.
- **Cuántos lo comparten:** si varias pantallas o zonas lo leen o modifican → Store. Ejemplos: carrito de compras, usuario autenticado, el HP del héroe.
- **Trazabilidad / depuración:** si necesitas saber *quién* cambió *qué* y *cuándo* (DevTools, un log como esta consola, time-travel) → Redux.
- **Complejidad de derivaciones:** muchos valores calculados que cruzan datos → selectores memoizados.
- **Testabilidad:** los reducers y selectores son funciones puras que se prueban sin UI.
- Cierre: *"No todo va a Redux. Empiezo local y escalo al Store cuando el dato se vuelve compartido."*

---

## Preguntas que podrían hacerte

- **¿Por qué `createSelector` y no una función normal?** Porque una función normal que devuelve un objeto nuevo en cada llamada hace que `useSelector` vea un valor "distinto" en cada render y re-renderice siempre. `createSelector` devuelve la misma referencia si las entradas no cambiaron.
- **¿El reducer de `actionLog` se ejecuta si despacho `stats/incrementStat`?** Sí. Un dispatch pasa por el root reducer, que llama a los reducers de los 3 slices. El matcher decide si hace algo.
- **¿Por qué se registra `takeDamage -5` si no cambia el HP?** Porque la acción **sí se despachó**. El reducer de stats la ignora (está validada), pero el log registra el intento. El log refleja acciones, no cambios de estado.
- **¿Por qué no `Date.now()` en el log?** Un reducer debe ser puro: misma entrada → misma salida. Si hiciera falta la hora, se pondría en un `prepare` callback del action creator (fuera del reducer).
- **¿Qué hace `configureStore` aparte de combinar reducers?** Activa DevTools, el middleware de thunk y, en desarrollo, chequeos que avisan si mutas el state fuera de Immer o si guardas datos no serializables.
- **¿Por qué `equippedIds` y no una copia de los ítems equipados?** Para no duplicar datos. El catálogo es la única fuente de verdad, y `selectEquippedItems` hace el "join".
