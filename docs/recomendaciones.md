# Recomendaciones locales del prototipo

El motor es una función local determinista. No llama a una IA, no analiza fotografías y no consulta el clima. La ocasión es manual; la UI suministra temperatura y lluvia manuales o derivadas de Open-Meteo. Los nombres, colores, abrigo y etiquetas de las prendas son datos declarados por la persona. El análisis opcional de fotos propone nombre, categoría y colores; solo los atributos confirmados llegan al inventario.

## Reglas y preferencias

Las prendas deben existir en el guardarropa actual y estar disponibles. Un color excluido impide usar toda la prenda, incluso si tiene otros colores o el mismo color también aparece entre los preferidos. Se ignoran mayúsculas, espacios al inicio/final y acentos al comparar colores. Estos son límites obligatorios.

Cada combinación usa parte de arriba + parte de abajo, o una prenda completa, y siempre incluye calzado. Puede llevar una capa exterior y un accesorio. No se infiere género ni se obliga a usar prendas por identidad. Una prenda completa ocupa la base entera; no se mezcla con partes de arriba o de abajo.

Ocasión, abrigo, lluvia, colores preferidos, estilos elegidos y rotación son preferencias flexibles. El motor favorece las etiquetas correspondientes, el abrigo aproximado, calzado/capa marcados para lluvia y las prendas sin uso reciente. Si hay pocas opciones puede repetir prendas o proponer protección incompleta, con advertencias visibles. Un guardarropa negro funciona: no se exige variedad de colores. La comodidad térmica y la etiqueta de lluvia son aproximaciones, no garantías sobre materiales o seguridad.

Los estilos disponibles son minimal, clásico, urbano, relajado, creativo, deportivo, girly y femenino. Son etiquetas que la persona elige para sí misma o para una prenda; no describen ni deducen su género. La afinidad usa exclusivamente las etiquetas explícitas `WardrobeItem.styleIds` y `Context.styleIds`. Las prendas antiguas sin etiqueta siguen participando. Las etiquetas desconocidas no aportan puntuación. Nunca se deduce un estilo de un nombre, categoría, color o género. La razón de estilo aparece sólo si la combinación contiene una prenda con una etiqueta que coincide con las elecciones de la persona. Varias etiquetas coincidentes en una misma prenda no multiplican su peso.

La rotación usa `lastWornAt` y una ventana configurable en días transcurridos de 24 horas. Cero días desactiva esta preferencia. Registrar uso actualiza la fecha y aumenta `wearCount`; no representa lavado automático ni hace que una prenda deje de estar disponible. La disponibilidad se controla manualmente. El historial de la interfaz puede conservar las combinaciones; el motor sólo necesita la última fecha por prenda.

## Contrato

`src/domain/index.ts` exporta los modelos serializables, los identificadores de categorías, ocasiones, estilos y colores, `seedWardrobe`, `createDefaultContext`, `generateRecommendations`, `swapOutfitItem`, `recordOutfitWorn` y la lectura de motivos (`parseReason`, `parseWarning`). El dominio no escribe texto visible: sus nombres y frases están en los catálogos de `src/i18n` ([ADR-012](adr/0012-idiomas-con-catalogos-tipados.md)). `context.now` se entrega como fecha ISO para reproducir resultados y pruebas.

`generateRecommendations(wardrobe, context, { limit: 3 })` devuelve estado `ready`, `empty` o `insufficient`, un `problem` que explica la falta de propuestas (qué pieza falta, o por qué no se puede combinar la prenda fijada) y combinaciones con razones/advertencias. Razones y advertencias son códigos de texto como `occasion:work`, `warmth:22` o `worn-recently`; los conjuntos guardados antes de los códigos conservan frases en español que `parseReason` y `parseWarning` también entienden. Los identificadores de combinaciones dependen de los identificadores ordenados de sus prendas. La misma entrada produce el mismo resultado. La escasez devuelve menos alternativas; nunca agrega prendas imaginarias.

`swapOutfitItem(outfit, slot, itemId, wardrobe, context)` cambia sólo una categoría existente. `itemId: undefined` elige la alternativa mejor puntuada. No agrega una categoría vacía ni convierte automáticamente una base de dos piezas en una prenda completa. Devuelve `unavailable` con un `problem` (`outfit-changed`, `slot-missing` o `no-option`) si no existe una alternativa válida o la combinación guardada quedó obsoleta.

`recordOutfitWorn(wardrobe, outfit, now)` devuelve `{ status, wardrobe }`. Revalida los identificadores, la base completa y disponibilidad contra el guardarropa actual. Una instantánea de historial con prendas eliminadas o no disponibles no puede registrarse. La interfaz debe guardar el `wardrobe` devuelto sólo si el estado es `recorded`. Registrar dos veces cuenta como dos usos; la interfaz controla la acción explícita de registrar.

## Límites de búsqueda

Para acotar el trabajo con cientos o miles de prendas, se puntúan primero hasta 24 opciones por categoría de base, 16 de calzado, 4 capas y 2 accesorios. Se conservan hasta 120 bases, luego 96 bases con calzado, y se exploran sus extras. Se ofrecen entre 1 y 10 combinaciones; las alternativas posteriores penalizan solapamiento de base y calzado con las anteriores para aportar variedad. Cambiar sólo accesorios o capas no cuenta como mayor diversidad, aunque una combinación con la misma base aún puede aparecer si puntúa mejor.

Esta poda puede omitir combinaciones mejores globalmente o algunas prendas válidas. Los resultados son sugerencias útiles, no una búsqueda exhaustiva ni un criterio profesional de estilo. Los colores preferidos no garantizan una coincidencia si faltan prendas compatibles o quedan fuera del grupo acotado. No se modelan ropa interior, trajes de varias piezas vinculadas, varias capas, materiales, tallas, calendario, zonas horarias de viaje ni pronóstico meteorológico.

## Verificación

Las pruebas de `tests/domain.test.ts` cubren pertenencia al guardarropa, disponibilidad, exclusión de colores, negro, escasez, prenda completa, rotación flexible, clima manual, ocasión, determinismo, diversidad, cambio de una prenda, registro inmutable, instantáneas obsoletas y afinidad de estilos sin saltarse los límites obligatorios. También ejercitan un guardarropa de 1,440 prendas. Estas pruebas verifican el dominio; no demuestran persistencia real, comportamiento de cámara/galería o ejecución en un dispositivo móvil.

## Datos locales, perfil y apariencia

El esquema local v3 conserva la misma clave de almacenamiento `@arma-tu-outfit/v1` para poder leer guardarropas existentes. `parseLocalData` valida y migra v1/v2 en memoria sin escribir ni borrar datos. Conserva prendas, fotografías, preferencias, contexto, guardados, descartes, historial y el indicador `onboarded`. Desde v1 agrega perfil y apariencia; desde v1/v2 agrega clima manual por defecto. Una persona que ya terminó la introducción sigue con `onboarded: true`; no se le impone otra introducción. Un guardarropa vacío se conserva vacío. Las versiones desconocidas o los datos incompatibles arrojan un error y no se sustituyen por ejemplos.

El perfil contiene `name` y `styleIds`. La apariencia contiene `themeId` (`linen`, `paper`, `midnight` o `sage`), `outfitLayout` (`editorial` o `compact`) y `showReasons`. La apariencia cambia la presentación y no interviene en la puntuación de prendas. Las etiquetas de estilo son opcionales para las prendas, pero un v2 persistido valida que los identificadores de estilos y temas sean conocidos.

`createLocalData()` crea datos independientes sin prendas, `onboarded: false` y `onboarding: { step: 0 }`. La interfaz puede persistir cada interacción y un paso entre 0 y 3 para continuar una introducción interrumpida. El campo de progreso es opcional para usuarios migrados y quienes terminaron. `createDefaultProfile()` y `createDefaultAppearance()` devuelven objetos nuevos. El valor inicial de apariencia es linen, editorial y razones visibles.

Las pruebas de `tests/storage.test.ts` verifican migración conservando todos los campos anteriores, fotos y guardados, usuarios que ya terminaron, guardarropas vacíos, progreso parcial, perfil, apariencia, rechazo de v2 inválido/versiones desconocidas y serialización semántica de ida y vuelta. La lectura migra en memoria; después de hidratar, el efecto de persistencia de la app guarda el documento v3 en la misma clave mediante la cola de escrituras.

## Combinar una prenda elegida

`generateRecommendations` acepta `pinnedItemId` junto con `limit`. La prenda elegida se valida contra el clóset actual, disponibilidad y colores excluidos. Se fija antes de recortar los grupos de candidatas y participa en todas las combinaciones. Si es una capa o accesorio, su categoría deja de ser opcional durante esa búsqueda. Las combinaciones mantienen la estructura habitual. La interfaz pide hasta dos opciones y permite cambiar las demás piezas.

## Quiero usarla más

La marca es opcional y vive en la prenda como `wearMore`. Los documentos v3 anteriores se leen con la marca desactivada. Hoy muestra un solo acceso bajo el conjunto principal. Primero aprovecha las opciones visibles y, si ninguna contiene una prenda marcada que encaje, prueba hasta tres prendas marcadas con el generador de prenda fija. Comprueba disponibilidad, exclusiones, ocasión, abrigo estimado y calzado marcado para lluvia si aplica. Entre prendas candidatas se prioriza el uso registrado menos reciente. Registrar uso deja descansar la prenda durante la ventana de rotación, con un mínimo de un día, y conserva la marca.

### Cómo evaluar una recomendación

1. **Validez.** Prendas propias, disponibles, sin colores excluidos y con una base completa. Una pieza elegida se conserva. Estos son criterios de prueba, independientemente de la puntuación.
2. **Contexto.** Ante el mismo clóset, comparar qué se propone con calor, frío, lluvia y distintas ocasiones. Revisar primero los casos donde un conjunto ocupa el primer lugar y la persona lo descartaría por clima u ocasión.
3. **Gusto y rotación.** Usar colores y estilos declarados, más el uso confirmado. La ausencia de historial solo significa que la app todavía no registró usos. Mostrar una razón breve y conservar las advertencias.
4. **Utilidad en el teléfono.** En el piloto, registrar tiempo hasta elegir, si cambió una pieza y si se puso el conjunto. Anotar por separado los recorridos de Hoy y de una prenda marcada. Guardar un conjunto sirve como señal secundaria. Si la gente descarta opciones, conservar ejemplos concretos para comparar cambios de ranking con el mismo clóset y contexto.

Probar primero un cambio de ranking a la vez. Evaluar IA para ordenar conjuntos válidos solo si las reglas siguen fallando en casos de gusto o coordinación que se repiten después de corregir los atributos de las prendas.

## Elección opcional con IA

En desarrollo, **Elegir con IA** aparece en Hoy si hay al menos dos propuestas que encajan con la ocasión, el abrigo estimado y el calzado para lluvia. Usa las opciones visibles que ya pasaron los filtros del clóset. El servidor local compara sus atributos con este orden:

1. Adecuación al plan y al clima. Considerar el abrigo de las piezas y, con lluvia, si el calzado y la capa están marcados para lluvia.
2. Estilos y colores declarados, con una paleta que tenga sentido en conjunto.
3. En empate, prendas que la persona quiere usar más y rotación reciente.

La respuesta es el índice de una opción existente. Promueve esa opción a la primera posición y conserva las demás. Las razones y advertencias siguen saliendo de las reglas locales. La app envía solo al tocar el botón, sin fotos, nombres, ciudad ni historial detallado. Si el servidor falla o cambia el contexto, queda el orden local.

Para saber si aporta valor, comparar la primera propuesta local con la elegida por IA usando los mismos clósets y contextos. Anotar cuál se pondría la persona, si tuvo que cambiar una pieza y el tiempo hasta elegir. Una prueba con un índice simulado comprueba el flujo, pero la calidad depende de una comparación con el proveedor real y personas.

## Objetivo de estilo

`StyleGoal` guarda los estilos a los que la persona quiere acercarse, si está explorando y, de forma opcional, el tono de la prueba de colorimetría. Es un campo opcional del esquema v3.

Con **Algo nuevo**, `context.styleIds` pasa a ser el objetivo y `context.explore` sube el peso de la afinidad de 15 a 40 y favorece prendas con un uso o ninguno. Disponibilidad, colores excluidos y base válida no cambian. Si faltan prendas con esas etiquetas, las sugerencias siguen con la ropa disponible y `styleGaps` indica las categorías sin cubrir; no se inventan prendas.

La prueba de colorimetría (`src/domain/colorimetry.ts`) hace nueve comparaciones en tres rondas: temperatura, estación y subtipo. Cada ronda se decide por mayoría y las rondas siguientes dependen de las anteriores. Un empate conserva la primera opción e informa baja confianza. Los lados se alternan para que la preferencia por un lado no decida.

`suggestedColors` traduce el tono a cinco colores como máximo y quita los excluidos. Es una convención de estilismo, no una medición: por eso el tono no puntúa conjuntos y los colores solo se suman a favoritos si la persona los elige. Con 12 nombres de color tampoco distingue un rojo cálido de uno frío.
