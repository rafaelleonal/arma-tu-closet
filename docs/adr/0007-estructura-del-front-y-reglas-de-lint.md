# ADR-007 — Estructura del front y reglas de lint

- Fecha: 2026-10-28
- Estado: aceptada para el prototipo
- Alcance: `App.tsx`, `src/screens/`, `src/hooks/`, `src/components/`, `eslint.config.js`

## Contexto

`App.tsx` tenía 1.539 líneas. Una sola función de unas 960 líneas contenía la carga, el guardado, las tres pestañas, las hojas y los estilos. `ItemEditor.tsx` y `Onboarding.tsx` tenían cerca de 770 líneas cada uno. Cambiar una pestaña obligaba a leer las otras, y los límites de [AGENTS](../../AGENTS.md) entre dominio, almacenamiento e interfaz dependían solo de la revisión manual.

## Decisión

Separar la interfaz por responsabilidad, sin cambiar el comportamiento ni el esquema:

| Carpeta | Contenido |
|---|---|
| `App.tsx` | Proveedores y elección entre carga, onboarding y pestañas. |
| `src/screens/` | Una pantalla por pestaña (`TodayScreen`, `ClosetScreen`, `StyleScreen`), `HomeShell` con las hojas y editores, `StartScreens` y las acciones sobre el documento (`actions.ts`). |
| `src/hooks/` | `useLocalData` (lectura y reintento), `useAutosave` (escritura y avisos posteriores al guardado) y `useRecommendations` (contexto y sugerencias). |
| `src/components/` | Piezas reutilizables. Los componentes con varias partes tienen carpeta propia (`item-editor/`, `onboarding/`) y conservan su archivo de entrada. |

ESLint usa `eslint-config-expo` y `eslint-config-prettier`, más dos grupos de reglas:

- **Límites de arquitectura (error):** `no-restricted-imports` por carpeta. `src/domain` no importa React, React Native, Expo, almacenamiento, red, tema ni interfaz. `src/storage`, `src/weather`, `src/ai` y `server` no importan interfaz ni tema. `src/theme` no importa dominio, almacenamiento ni interfaz.
- **Tamaño del front (error):** en `App.tsx`, `src/components`, `src/screens` y `src/hooks`, como máximo 300 líneas por archivo, 200 por función, complejidad 15 y profundidad 4, sin contar líneas en blanco ni comentarios. También se prohíbe declarar componentes dentro de otros componentes.

## Alternativas

| Alternativa | Motivo para descartarla ahora |
|---|---|
| Expo Router con rutas por archivo | Cambia navegación, enlaces y estructura de arranque; tres pestañas no lo justifican todavía. |
| Librería de estado global | El estado cabe en un documento local con un único `update`; añadiría una dependencia sin un problema concreto. |
| Carpetas por funcionalidad (`features/closet/…`) | Útil con más pantallas; hoy duplicaría la separación por capas que ya documenta AGENTS. |
| Reglas de tamaño solo como aviso | Los avisos se acumulan sin bloquear; se usaron durante la migración y se subieron a error al cumplirlas. |
| `eslint-plugin-prettier` (la guía de Expo) | Mezcla errores de formato con los de lógica y es más lento; Prettier se ejecuta aparte con `pnpm format:check`. |

## Consecuencias y revisión

Cada pestaña se lee por separado, y un import que cruce un límite falla en `pnpm lint`. Hay más archivos y más props que pasar: las pantallas reciben `data` y `update` en lugar de leer un estado global. Las reglas de tamaño no cubren el dominio, el almacenamiento ni el servidor, cuyos validadores siguen siendo ramificados. Un `eslint-disable` debe llevar un comentario con el motivo.

Revisar si aparecen más de cinco pantallas, navegación profunda o estado compartido entre pestañas que no quepa en el documento local: en ese caso, evaluar Expo Router o una organización por funcionalidad.

## Referencias

- [eslint.config.js](../../eslint.config.js), [App.tsx](../../App.tsx), [pantallas](../../src/screens/), [hooks](../../src/hooks/).
- [Expo: Using ESLint and Prettier](https://docs.expo.dev/guides/using-eslint/).
