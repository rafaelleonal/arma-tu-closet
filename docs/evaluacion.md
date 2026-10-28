# Verificación de clima y registro asistido — 23/10/2026

Estado: implementación local integrada. Tres agentes GPT-6.1 Sol separaron clima/persistencia, editor/cliente y servidor; el agente principal revisó los archivos, integró la UI y ejecutó la comprobación conjunta.

## Evidencia de esta entrega

- `npm run typecheck`: sin errores.
- `npm test`: **69/69** aprobadas. Incluyen migración v1/v2→v3, caché de ciudad/frescura, timeout/cancelación, validación de fotos, fallos de proveedor, Host/Origin, cuotas y contrato de OpenAI Responses mediante transporte falso.
- `npx expo export --platform all`: bundles web, iOS y Android exportados. No son binarios instalados ni pruebas en teléfono.
- Consulta real con el cliente a Open-Meteo: Ciudad de México, 22.1 °C, sensación 22.3 °C, sin precipitación; dato 2026-10-23T20:00:00Z recibido 20:11:47Z. Estos valores son evidencia puntual, no clima vigente para consultas futuras.
- Navegador en `http://localhost:8082`: buscar ciudad, seleccionar, aplicar automático, ver temperatura/hora/atribución y conservar ciudad/caché al recargar. Cambio a manual de 18 °C y vuelta a automático conservan la configuración manual.
- Alta con `tests/fixtures/photo.png`: no se envía al elegir; botón Analizar muestra propuesta separada. El borrador manual seguía intacto. Se corrigió el nombre, se aplicó blanco reemplazando negro, se guardó y sobrevivió a recarga con foto y color confirmado.
- Se canceló un análisis pendiente sin aplicar una respuesta tardía. Sin clave, el servidor normal devuelve 503 y permite seguir completando a mano.
- Revisión visual en Medianoche a 390×844 y 320×740. Las pruebas de contraste de los cuatro temas siguen aprobadas; no se repitió auditoría visual de todos los temas.

**IA simulada:** la propuesta del recorrido vino de un proveedor temporal inyectado en el servidor, nunca de OpenAI. El proceso falso y los servidores de QA se detuvieron después; el servidor Expo principal en 8081 se conserva. A petición del usuario no se configuró clave ni se hizo inferencia real; precisión, costo, latencia y acceso al modelo de la cuenta siguen sin verificar.

La revisión detectó y corrigió el reemplazo de una caché recién actualizada al aplicar un formulario de clima abierto. El guardado conserva el snapshot más reciente de la misma ciudad. Se revisaron cancelaciones y cambios de foto para que no sobrescriban el formulario.

## Capturas

- [Clima automático real, 390 px](evidence/clima-automatico-390.png).
- [Revisión de atributos con respuesta simulada, 390 px](evidence/ia-revision-simulada-390.png).
- [Error sin clave con formulario conservado, 320 px](evidence/ia-sin-clave-320.png).

## Límites pendientes

- Cámara, permisos, transporte HTTP/HTTPS y persistencia en dispositivos iOS/Android reales. Un teléfono necesita transporte al proxy; loopback no es la IP de la computadora.
- El proxy es solo local, sin cuentas ni autenticación pública. Requiere otra arquitectura de acceso para distribución.
- Calidad del reconocimiento con fotos reales y múltiples tipos de prenda; no se mide con respuestas fijas.
- Caché caducada y red fallida están cubiertas en pruebas del cliente y helpers; no se esperaron tres horas en navegador.
- No se validó utilidad cotidiana ni demanda comercial. Las limitaciones históricas de almacenamiento y dependencias siguen aplicando.

---

# Evaluación del prototipo

Fecha: 23 de octubre de 2026. Proyecto local, sin publicación ni cuentas externas creadas.

## Iteración de textos e ilustraciones

Se retiraron eslóganes, descripciones decorativas, encabezados redundantes y títulos promocionales de los conjuntos. Los agentes Sol 6.1 revisaron el texto, los motivos del recomendador y la integración de imágenes. Se conservaron instrucciones necesarias, errores y advertencias.

Nueve PNG originales generados con `image_gen` sustituyen las siluetas geométricas. Comparten trazo redondo, una tinta, espacios transparentes y caras pequeñas; las referencias fueron las dos imágenes aportadas por el usuario. [Archivos y prompts](../assets/garments/README.md).

- Las ilustraciones adaptan su tinta al tema. Los colores declarados de cada prenda aparecen en muestras separadas. Las fotos tienen una rama de renderizado sin tintado.
- Revisión visual web de Hoy, clóset y vistas de temas; inspección a 390 × 844 y 320 × 740. Medianoche conservó la selección después de recargar.
- TypeScript y las 33 pruebas existentes pasan. La exportación web/iOS/Android incluye los nueve archivos; no demuestra ejecución en un dispositivo nativo.
- Revisión independiente: archivos presentes, transparencia real y tintado compatible con las versiones instaladas. Se corrigieron un encabezado de alternativas vacío y la falta de indicación de foto opcional.
- Son imágenes genéricas por categoría y nombre, sin análisis de fotos. La familia todavía no distingue todos los accesorios, tipos de calzado o prendas completas.

Evidencia: [clóset ilustrado](evidence/closet-ilustrado.jpg) y [Medianoche](evidence/ilustraciones-medianoche.jpg).

## Iteración de onboarding y personalización

La segunda iteración usó los mismos tres agentes GPT-6.1 Sol: componentes, dominio/migración y evaluación de producto. El principal integró el sistema de temas, revisó sus entregas y realizó QA web. Las referencias y criterios están en [diseño y personalización](diseno-personalizacion.md).

Implementado: cuatro pasos con nombre y estilos opcionales, colores preferidos/evitados, ocasión, rotación, cuatro temas, vista compacta/editorial y motivos opcionales. Progreso persistido, edición posterior sin reiniciar el clóset, etiquetas de estilo y varios colores por prenda. La disponibilidad y colores excluidos siguen siendo restricciones del recomendador.

La revisión independiente detectó y se corrigieron tres defectos: el detalle ignoraba preferencias de presentación; un título no tenía contraste en Medianoche; y el editor solo guardaba un color pese a permitir exclusiones sobre varios. La inspección visual también llevó a mejorar contornos de prendas oscuras, la cuadrícula a 320 px y la exposición de estados seleccionados para accesibilidad web.

Verificación de esta iteración:

- **33/33 pruebas:** 20 de dominio, 9 de esquema/migración y 4 de contraste de paletas. Textos principales, secundarios, acciones y etiquetas tienen al menos 4.5:1 sobre las superficies declaradas; esto no sustituye una auditoría completa de accesibilidad.
- **TypeScript y exportación de web/iOS/Android:** pasan; los bundles no prueban ejecución nativa.
- **Onboarding real en web:** elegir tres estilos y rechazar el cuarto; mover un color de favorito a evitado sin duplicarlo; recargar en el paso 3 y recuperar progreso; retroceder conservando elecciones; elegir ocasión, rotación, tema y demo; recargar y conservar nombre, preferencias y presentación.
- **Ruta propia:** completar sin nombre ni estilos, omitir preferencias, iniciar con clóset vacío; crear una prenda blanca/roja etiquetada Minimal, rechazar cero colores, guardar y volver a abrir después de recargar con ambas selecciones y estilo intactos.
- **Temas:** inspección visual de las cuatro apariencias en onboarding y de Medianoche en Hoy, estados vacíos, editor y detalle. Ocultar motivos conserva las advertencias y la vista compacta también en el detalle.
- **Tamaños web:** recorrido principal a 390 × 844, inspección a 320 × 740. No son pruebas en teléfonos físicos.
- **Volver a personalizar:** se completó el recorrido de edición en la demo existente y se conservaron sus 12 prendas disponibles.

Capturas de esta iteración: [elección de estilos](evidence/onboarding-estilos.jpg) y [cuatro temas](evidence/onboarding-temas.jpg).

Se usaron `localhost:8082` y `[::1]:8082` como orígenes de QA separados. La prueba de migración compara todos los campos v1, fotos, prendas no disponibles, preferencias, guardados e historial. La preservación de esos campos se verificó automatizadamente; no se simuló una migración nativa en teléfono.

Las limitaciones de móvil real, almacenamiento, respaldo y dependencias descritas abajo siguen pendientes. Las secciones siguientes conservan la evidencia de la primera entrega.

## Resultado y trabajo de los agentes

Se asignaron tres agentes **GPT-6.1 Sol**, como pidió el usuario. El agente principal revisó las entregas, ejecutó verificaciones independientes, reforzó la persistencia y probó la interfaz en navegador.

| Área | Entrega | Evaluación |
|---|---|---|
| Producto | Hipótesis, alcance, competidores oficiales, piloto y criterios de aceptación | Útil para orientar el aprendizaje. Necesidad, diferenciación y disposición a pagar aún sin validar con personas. |
| App móvil | Expo/React Native, tres secciones, editor de prendas/fotos, cambios, guardados, uso y composición manual | Aceptada como prototipo local. Flujo web comprobado; ejecución en teléfono pendiente. |
| Recomendaciones | Dominio TypeScript separado, reglas deterministas, estados vacíos, intercambio y registro de uso | Aceptado para probar la idea. 16 pruebas; no representa un estilista profesional ni aprendizaje automático. |
| Integración del principal | Validación del documento local, límite agregado web, 4 pruebas de persistencia, revisión y correcciones de UI | 20 pruebas combinadas, revisión visual y recorrido completo en navegador. |

## Correcciones exigidas durante la revisión

1. A 35 °C se priorizaban botines sobre tenis ligeros equivalentes. Se corrigió la puntuación térmica del calzado y se añadió una regresión.
2. Variar únicamente una capa o accesorio podía inflar la aparente diversidad. La selección ahora considera el solapamiento de base y calzado.
3. Los accesorios participaban en la combinación pero no aparecían en la tarjeta. Ahora se muestran y pueden cambiarse.
4. El registro de «hoy» usaba el día UTC. Se cambió al día local del dispositivo.
5. La lectura local aceptaba estructuras internas incompletas. Se valida el esquema antes de hidratar; un documento inválido no se reemplaza con la demo.
6. Los mensajes de guardado aparecían antes de resolver la escritura. Ahora se confirman tras persistir y se muestran los errores; web limita el tamaño total antes de escribir.
7. Un rechazo al registrar un conjunto guardado quedaba oculto detrás del modal. Ahora el aviso queda visible; también se explica que los guardados conservan sus detalles originales.
8. Se alineó React Native con la versión del SDK: `0.83.10`.

## Verificación automatizada

| Comprobación | Resultado | Límite |
|---|---|---|
| `npm run typecheck` | Pasa en el código final | Análisis estático. |
| `npm test` | 20/20: 16 dominio + 4 esquema/serialización | Persistencia de datos puros, no almacenamiento nativo. |
| `npx expo install --check` | Dependencias alineadas | La comprobación final del principal usó el mapa local del SDK por falta de red. |
| `CI=1 EXPO_OFFLINE=1 npx expo export --platform all` | Pasa después de las últimas correcciones | Bundles web (~537 KB), Android (~2.1 MB), iOS (~2 MB). No son binarios firmados ni prueba de ejecución móvil. |

Las pruebas cubren prendas existentes/disponibles, exclusiones, clóset negro, escasez, prenda completa, clima manual, rotación, determinismo, diversidad, intercambio, datos obsoletos, 1,440 prendas y validación local. La prueba de tamaño agregado verifica rechazo antes de escribir; no se forzó la cuota real del navegador.

## Recorrido real en navegador

Ejecutado sobre Expo local a **390 × 844**, con inspección adicional de **320 × 740** y **768 × 1024**. Son dimensiones web, no pruebas en iPhone, Android o iPad.

- Abrir la demo y reconocer sus prendas como ficticias.
- Rechazar 100 °C; aceptar 5 °C, lluvia y trabajo; observar sugerencias distintas.
- Cambiar suéter por camisa y guardar la combinación.
- Comprobar 0 usos después de guardar; registrar uso y comprobar 1.
- Recargar y conservar contexto, guardados y uso.
- Excluir negro; comprobar que sale de las sugerencias.
- Desactivar el único calzado permitido restante; comprobar insuficiencia sin conjuntos inventados.
- Crear «Tenis de prueba» con imagen sintética local; comprobar prenda e imagen después de recargar.
- Rechazar un conjunto manual incompleto; completar camisa + jeans + calzado y guardarlo.
- Desactivar una prenda del conjunto guardado; intentar registrar uso; comprobar rechazo visible y contador sin incremento.

No se observaron excepciones de la app en los registros consultados. Hubo una advertencia de desconexión de Metro durante un reinicio deliberado. Una selección de foto interrumpida por recarga de desarrollo se repitió al terminar los cambios; la prueba posterior completó alta y recarga.

QA utilizó `localhost:8081`. La pestaña entregada usa `127.0.0.1:8081` con demo limpia en otro origen de almacenamiento; no contiene la prenda sintética ni las preferencias alteradas en QA.

Evidencia: [vista móvil](evidence/prototipo-mobile.jpg) y [vista de tablet](evidence/prototipo-tablet.jpg).

## Limitaciones pendientes

- **Móvil real:** cámara, permisos denegados, galería, teclado, archivos tras reiniciar y lector de pantalla. No se ejecutó un simulador nativo.
- **Fotos:** manuales; archivos nativos sin referencias no se limpian todavía. Web tiene almacenamiento acotado.
- **Uso y guardados:** sin deshacer uso ni editar historial; guardados conservan instantáneas. El motor usa la última fecha de cada prenda y la UI conserva hasta 365 registros.
- **Recomendador:** búsqueda acotada y reglas aproximadas. Sin pronóstico, tendencias, reconocimiento de imágenes ni modelo que aprenda gustos. Ciudad/estación son etiquetas manuales.
- **Producto:** no se midió utilidad o disposición a pagar. El compositor selecciona categorías; no es un lienzo libre para arrastrar prendas.
- **Dependencias:** el agente móvil reportó 4 avisos altos de `npm audit` derivados de `node-forge`. El principal verificó `node-forge@1.4.0` bajo Expo CLI y certificados de firma. El [aviso GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) incluye esa versión y no publica parche a la fecha consultada. No se aplicó el downgrade incompatible sugerido por npm. Reevaluar antes de distribución; no se demostró una vía explotable desde las pantallas del prototipo.

## Siguiente paso recomendado

Abrir esta misma app con Expo en un teléfono y recorrer alta de tres prendas propias, elección, intercambio, uso y cierre/reapertura. Después probar una semana con pocas prendas antes de añadir IA, backend o monetización.

## 23/10/2026 — Interacción móvil y preparación de iPhone

Implementados: transiciones breves con Reducir movimiento, haptics de selección y de escritura confirmada, preferencia opcional de vibración compatible con v3, confirmación antes de descartar una prenda modificada, errores junto a campos y recuperación de cámara bloqueada con Abrir Ajustes.

Verificación ejecutada: 72 tests aprobados; TypeScript sin errores; exportación SDK 55 web/iOS/Android después de corregir la envoltura animada de los controles. La primera ejecución de tests encontró `EPERM` al abrir puertos en el sandbox; la repetición autorizada con servidores simulados de loopback pasó. No hubo llamadas reales a OpenAI.

En navegador `localhost:8082`, Medianoche: nombre vacío, cero colores y cero ocasiones impiden guardar con error junto al campo; editar → cerrar → seguir editando conserva el valor; guardar muestra Prenda guardada y la prenda reaparece al recargar; abrir y cerrar sin cambios no pide confirmación. A 320 px, descartar una edición conserva la prenda original. El clóset de QA pasó de 13 a 14 prendas; el clóset habitual de 8081 no se alteró. Capturas: [error a 390 px](evidence/formulario-error-390.png), [descarte a 390 px](evidence/cambios-sin-guardar-390.png) y [descarte a 320 px](evidence/cambios-sin-guardar-320.png).

El subagente Sol 6.1 revisó código y evaluación de UI/UX; el principal comprobó los recorridos anteriores. Queda como mejora posterior la ubicación del error en la revisión de atributos IA. No se comprobaron VoiceOver, el tacto ni Reducir movimiento con el sistema real.

Para Expo Go de App Store se preparó una copia temporal SDK 54.0.38, React Native 0.81.5 y React 19.1.0. Aprobó compatibilidad de dependencias, TypeScript y exportación iOS. El manifiesto LAN respondió con SDK 54 y la IP correcta. Esto no equivale a ejecución en iPhone ni valida SDK 55 en ese dispositivo. npm informó 5 avisos altos en el proyecto principal y 7 en la copia (1 moderado, 6 altos); no se aplicó una corrección forzada ni se considera lista para distribución.

**Pausa solicitada por el usuario:** todavía no abrió/probó el recorrido en el teléfono. Cámara, permisos, haptics y prendas/fotos después de cerrar Expo Go quedan sin verificar. Se detuvieron los servidores de QA 8082 y preview 8083; el servidor principal previo no se detuvo. Retomar con [prueba de iPhone](prueba-iphone.md), confirmar IP vigente y emitir un QR nuevo. Los planes de [cuentas y datos](cuentas-y-datos.md) y [despliegue](deploy-plan.md) están documentados; no hay servicios cloud implementados ni despliegues realizados.

## 27/10/2026 — Bienvenida, ciudad por ubicación y formulario de prenda

Implementados: bienvenida antes de Tu estilo (no persistida), bloque Clima opcional en Tu rutina, **Usar mi ubicación** con búsqueda por nombre como respaldo ([ADR-005](adr/0005-ubicacion-para-elegir-ciudad.md)), y formulario de prenda con lo esencial primero, nombre opcional y **Más detalles** plegable. Se corrigió el punto recortado del logotipo en el onboarding y el icono de Creativo, que iOS mostraba como emoji.

Entorno: Expo SDK 58, React Native 0.88, instalación con pnpm (el proyecto ya no tenía `package-lock.json`). Se añadió `expo-location ~58.0.19`; `expo install` instaló el paquete, pero falló el paso de añadir el plugin, que se configuró a mano en `app.json`.

- `npm test`: **76/76** aprobadas, con regresiones de ciudad más cercana, variantes de nombre de ciudad, nombre sugerido y abrigo inicial.
- `npm run typecheck`: 51 errores (antes de la entrega: 54), todos previos a esta entrega y ligados a la actualización de SDK (tipos de refs de `ScrollView`/`TextInput`, `fetch` y falta de tipos de Node en `server/` y `tests/`). Ninguno en archivos nuevos.
- Navegador `localhost:8093` (origen de QA aparte), 390 px: bienvenida → Empezar → paso 3 → buscar «Comitán» → elegir Chiapas → terminar con ropa propia → Hoy muestra 23° Comitán automático. Guardar sin color muestra error; Capa exterior inicia en Abrigadora; guardar sin nombre crea «Capa exterior · café».
- Simulador iPhone 15 Pro, iOS 17.5, Expo Go, ubicación simulada en Comitán: bienvenida, onboarding y formulario de prenda. **Usar mi ubicación** muestra el diálogo del sistema; con permiso selecciona «Comitán, Estado de Chiapas, México». Con el permiso revocado muestra el aviso de bloqueo, **Abrir Ajustes** y la búsqueda por nombre.
- Fallos encontrados y corregidos durante la prueba: (1) se usaba primero una posición en caché del simulador (San Francisco); ahora se pide una posición actual y la caché solo es respaldo. (2) iOS devuelve «Comitán de Domínguez», que Open-Meteo no conoce; ahora también se busca la forma corta antes de « de ».

Sin verificar: iPhone físico, Android, el botón **Abrir Ajustes** llevando a Ajustes, textos de permiso de `app.json` (Expo Go muestra los suyos), VoiceOver y tema Medianoche en la bienvenida.

## 27/10/2026 — Tipos y herramientas tras SDK 58

Contexto: el proyecto pasó a Expo SDK 58, React Native 0.88, React 19.3 y TypeScript 6, instalado con pnpm. La persona eligió conservar pnpm.

Cambios:
- Refs de desplazamiento tipadas con `ScrollViewInstance` (React Native 0.88 ya no expone `ScrollView` como clase) en `App.tsx`, `Onboarding.tsx`, `ItemEditor.tsx` y `Sheet.tsx`. El `fetcher` por defecto de Open-Meteo se tipó como `typeof fetch`.
- TypeScript 6 ya no incluye `@types/*` automáticamente: `tsconfig.json` declara `"types": ["node"]` y `@types/node@^24` es dependencia de desarrollo explícita.
- Documentación: AGENTS, CONTRIBUTING, README, ROADMAP e integraciones piden pnpm y `pnpm-lock.yaml`, y citan SDK 58. La guía de iPhone indica que el proyecto abre directamente en Expo Go; la copia SDK 54 y `scripts/prepare-expo-go-preview.mjs` quedan como históricos (el script no se borró).

Comprobaciones:
- `pnpm typecheck`: 0 errores (antes 51).
- `pnpm test`: 76/76.
- `npx expo export --platform all` en una carpeta temporal: bundles web (387 módulos), iOS (1165) y Android (1176). La salida muestra muchos avisos de resolución de un `react-native@0.83.10` sobrante en `node_modules/.pnpm`; no impiden exportar.
- Enlaces relativos de los documentos modificados: todos existen.

Sin verificar: Android en dispositivo o emulador; una instalación limpia con `pnpm install --frozen-lockfile`.


## 27/10/2026 — Estilos Girly y Femenino

Se añadieron los estilos `girly` (Girly) y `feminine` (Femenino) a `STYLE_IDS`, con marcas ♡ y ❀ en Tu estilo. Son etiquetas elegidas por la persona; no se deducen de fotos ni describen su género. El documento sigue en versión 3: añadir valores al catálogo no invalida datos existentes y el esquema los acepta en perfil y prendas.

- `pnpm test`: 77/77, con una regresión de ida y vuelta de los estilos nuevos en perfil y prenda. `pnpm typecheck`: 0 errores.
- Simulador iPhone 15 Pro, Expo Go: Mi estilo → Editar preferencias muestra los ocho estilos en dos columnas; los símbolos se ven como texto, no como emoji.
- Scroll de Agregar prenda: no se reprodujo con arrastres en el simulador ni en web (la hoja mide 719 de 1094 px visibles y se desplaza). La persona confirmó después que funciona; no se cambió código para esto.

## 27/10/2026 — Temas Chicle y Malva

Se añadieron los temas de color Chicle (`bubblegum`, rosa juguetón) y Malva (`mauve`, rosa empolvado) a `THEME_IDS` y a las paletas, con los mismos roles que los temas existentes. Igual que los estilos, el documento sigue en versión 3 y el esquema acepta los nuevos valores. Un tema no cambia la puntuación.

- `pnpm test`: 79/79. Incluye el contraste 4.5:1 de texto, secundario, acción y etiquetas sobre todas las superficies (mínimo calculado: 5.14 en Chicle y 5.37 en Malva), y la ida y vuelta de `themeId: 'bubblegum'`. `pnpm typecheck`: 0 errores.
- Simulador iPhone 15 Pro, Expo Go: vistas previas de ambos temas en Mi estilo; Chicle y Malva aplicados en Mi estilo y Hoy (tarjeta de clima, botones, pestañas e interruptores); Malva también en la hoja Agregar prenda.

Sin verificar: onboarding y Chicle en hojas, y revisión con VoiceOver.

## 27/10/2026 — Perchero en Mi clóset y fotos de ejemplo

Mi clóset dejó la cuadrícula de tarjetas por un perchero (`src/components/ClosetRail.tsx`): prendas colgadas de canto que giran de frente al tocarlas, repisa para calzado y accesorios y panel con disponibilidad y edición. Se quitaron los filtros por categoría de esa pantalla. El clóset de ejemplo cambió a 10 prendas con fotos recortadas de Unsplash (identificadores `demo2-…`, créditos en `assets/demo/README.md`). Los ejemplos guardados antes conservan sus dibujos. El clóset vacío ofrece **Usar clóset de ejemplo**. Sin cambio de esquema.

- Recorte de fondo: macOS con `VNGenerateForegroundInstanceMaskRequest` (Apple Vision). 8 de 10 fotos de prendas quedaron limpias; se descartaron tenis con logo (Nike, Puma, Common Projects) y una foto donde el recorte incluyó una bolsa.
- `pnpm test`: 79/79. `pnpm typecheck`: 0 errores.
- Simulador iPhone 15 Pro, Expo Go, tema Malva: clóset de ejemplo desde el estado vacío, giro de la prenda elegida, selección de calzado en la repisa, panel con disponibilidad y Hoy con las fotos en la sugerencia.
- Navegador `127.0.0.1:8093` con el clóset de ejemplo anterior: el perchero usa dibujos con gancho dibujado.

Sin verificar: VoiceOver sobre el perchero, rendimiento con muchas prendas (no está virtualizado), Android y fotos propias con fondo en el perchero.

Actualización del mismo día: el perchero quedó solo para la bienvenida y el clóset de ejemplo; la ropa propia usa `ClosetGrid` (cuadrícula de fotos). Se probó y descartó un «look en el gancho» en Hoy; Hoy conserva las tarjetas. Typecheck 0 errores y 79/79 tests. Verificado después: en el simulador iPhone 15 Pro, al agregar una prenda propia sin foto Mi clóset cambia a la cuadrícula (filtros con conteo; las fotos de ejemplo se ven en sus cuadros). En web, desde un origen sin datos (`192.168.68.102:8093`), la bienvenida con el perchero animado quedaba en blanco porque `Image.resolveAssetSource` no existe en react-native-web; se corrigió en `demoPhotos.ts` y ahora las prendas giran de frente una tras otra. Sin verificar: VoiceOver sobre el perchero y la cuadrícula, Android, fotos propias reales en la cuadrícula.

## 28/10/2026 — Quitar fondo en el dispositivo y build de desarrollo

Se añadió el módulo local `modules/subject-cutout` (Apple Vision, iOS 17+), el campo opcional `cutoutUri` y la build de desarrollo (`expo-dev-client`, `npx expo run:ios`); decisión en [ADR-006](adr/0006-recorte-de-fondo-en-dispositivo.md). El documento sigue en versión 3, sin migración.

- Herramientas: CocoaPods 1.17 instalado con Homebrew (el Ruby del sistema fallaba al cargar `activesupport`) y plataforma iOS 26.5 descargada para Xcode 26.6.
- `pnpm test`: 80/80, con un test nuevo: el recorte es opcional, conserva la foto original y se rechaza sin ella. `pnpm typecheck`: 0 errores.
- `npx expo run:ios`: compila e instala en los simuladores iPhone 15 Pro (iOS 17.0) y iPhone 17 Pro (iOS 26.5). La bienvenida con el perchero, el onboarding y el clóset de ejemplo funcionan en la build.
- Agregar prenda con una foto de ejemplo de Unsplash (chamarra de mezclilla con fondo negro): aparece **Quitar fondo**, así que el módulo nativo se detecta. Al pulsarlo, Vision responde «Could not create inference context» (código 9) en ambos simuladores, también forzando la CPU. La app conserva la foto original y muestra «No pudimos quitar el fondo de esta foto.». Antes mostraba el error de Vision en inglés con el prefijo de Expo.
- Hallazgo de QA: Metro iniciado con `CI=1` no vigila archivos y sirve un bundle viejo a la app; se documentó en el README.
- Hallazgo de UX: al desaparecer el aviso superior («Preferencias guardadas»), el contenido de Mi clóset subía unos 50 pt; un toque en **Agregar prenda** en ese momento cayó dos veces en **Usar clóset de ejemplo**. Corregido: el aviso flota sobre el contenido, encima de las pestañas, y se cierra al tocarlo. Verificado en el simulador iPhone 17 Pro (iOS 26.5) al guardar un conjunto: el contenido no se mueve al mostrar ni al ocultar el aviso. Sin verificar en web, Medianoche ni VoiceOver.

Sin verificar: el recorte real en un iPhone (calidad, tiempo y memoria), **Usar original** y guardar con recorte, la cuadrícula con un recorte, VoiceOver en los nuevos botones, Android (sin implementación) y la limpieza de recortes sin referencia.

## 28/10/2026 — Prettier, ESLint y separación del front

- Prettier 3.9.10 (`pnpm format`, `pnpm format:check`) y ESLint con `eslint-config-expo` y `eslint-config-prettier` (`pnpm lint`). ESLint encontró 31 problemas; se corrigieron refs leídas o escritas durante el render, estados reiniciados al inicio de efectos y tipos `Array<T>`. Quedan dos excepciones con comentario: la primera actualización del clima al montar y las dependencias del contexto del día.
- `App.tsx` pasó de 1.539 a 69 líneas; `ItemEditor.tsx` de 770 a 190 y `Onboarding.tsx` de 769 a 110, repartidos en `src/screens/`, `src/hooks/`, `src/components/item-editor/` y `src/components/onboarding/` ([ADR-007](adr/0007-estructura-del-front-y-reglas-de-lint.md)). Los límites de arquitectura y de tamaño son errores de lint; se comprobó con un archivo temporal en `src/domain` que importar React o almacenamiento falla.
- `pnpm typecheck`, `pnpm lint` y `pnpm format:check` sin errores; `pnpm test` **80/80**.
- Navegador (Metro web en el puerto 8093, orígenes `localhost`, `127.0.0.1` y `[::1]` para clósets separados): bienvenida y perchero; onboarding completo con límite de 3 estilos, color que pasa de favorito a evitar, reanudación en el paso 4 tras recargar, ropa propia que deja el clóset vacío y modo edición con **Cerrar**; clóset de ejemplo; guardar conjunto, cambiar zapatos, **Lo usé hoy** (guardado 1, uso 1); colores excluyentes en Mi estilo; Mi clóset con perchero y vuelta al inicio al cambiar de pestaña; editor de prendas con error de colores, error de ocasión, **Descartar cambios**, alta guardada y edición sin cambios que cierra directo; tema Medianoche; búsqueda de ciudad en Open-Meteo y clima automático con hora de actualización. Sin errores en consola.

- Simulador iPhone 17 Pro (iOS 26.5) con la build de desarrollo y Metro sirviendo el código nuevo: en Hoy, cambiar los zapatos por botines, **Guardar** dentro de la hoja (muestra «Guardado con los detalles originales») y **Lo usé hoy** (cierra la hoja y las sugerencias rotan). En Mi clóset: perchero; **Agregar prenda** con la foto de ejemplo de la chamarra elegida de la galería («Guardando foto…» mientras abre el selector); **Quitar fondo** muestra «No pudimos quitar el fondo de esta foto.», como se espera en el simulador; cambiar a Capa exterior ajusta el abrigo a Abrigadora y el nombre sugerido; al guardar, la prenda aparece con foto en la cuadrícula y el aviso flota sobre el contenido. Al editarla, un cambio y la X muestran **¿Descartar cambios?**, y descartar cierra sin guardar. **Editar preferencias** recorre los cuatro pasos, muestra Vibración en el último y **Listo** vuelve a Mi estilo con «Preferencias guardadas.». Tras cerrar y abrir la app siguen las 11 prendas y la foto. Los toques en este simulador llegan con retraso: un segundo toque en **Guardar** quitó el conjunto de guardados, que es el comportamiento esperado del botón.

Sin verificar tras la separación: Android, cámara, **Analizar foto** con el servidor local, recorte real en un iPhone, VoiceOver y anchos de 320/390 px.
