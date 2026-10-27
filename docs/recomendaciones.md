# Recomendaciones locales del prototipo

El motor es una función local determinista. No llama a una IA, no analiza fotografías y no consulta el clima. La ocasión es manual; la UI suministra temperatura y lluvia manuales o derivadas de Open-Meteo. Los nombres, colores, abrigo y etiquetas de las prendas son datos declarados por la persona. El análisis opcional de fotos propone nombre, categoría y colores; solo los atributos confirmados llegan al inventario.

## Reglas y preferencias

Las prendas deben existir en el guardarropa actual y estar disponibles. Un color excluido impide usar toda la prenda, incluso si tiene otros colores o el mismo color también aparece entre los preferidos. Se ignoran mayúsculas, espacios al inicio/final y acentos al comparar colores. Estos son límites obligatorios.

Cada combinación usa parte de arriba + parte de abajo, o una prenda completa, y siempre incluye calzado. Puede llevar una capa exterior y un accesorio. No se infiere género ni se obliga a usar prendas por identidad. Una prenda completa ocupa la base entera; no se mezcla con partes de arriba o de abajo.

Ocasión, abrigo, lluvia, colores preferidos, estilos elegidos y rotación son preferencias flexibles. El motor favorece las etiquetas correspondientes, el abrigo aproximado, calzado/capa marcados para lluvia y las prendas sin uso reciente. Si hay pocas opciones puede repetir prendas o proponer protección incompleta, con advertencias visibles. Un guardarropa negro funciona: no se exige variedad de colores. La comodidad térmica y la etiqueta de lluvia son aproximaciones, no garantías sobre materiales o seguridad.

Los estilos disponibles son minimal, clásico, urbano, relajado, creativo, deportivo, girly y femenino. Son etiquetas que la persona elige para sí misma o para una prenda; no describen ni deducen su género. La afinidad usa exclusivamente las etiquetas explícitas `WardrobeItem.styleIds` y `Context.styleIds`. Las prendas antiguas sin etiqueta siguen participando. Las etiquetas desconocidas no aportan puntuación. Nunca se deduce un estilo de una foto, nombre, categoría, color o género. La razón de estilo aparece sólo si la combinación contiene una prenda con una etiqueta que coincide con las elecciones de la persona. Varias etiquetas coincidentes en una misma prenda no multiplican su peso.

La rotación usa `lastWornAt` y una ventana configurable en días transcurridos de 24 horas. Cero días desactiva esta preferencia. Registrar uso actualiza la fecha y aumenta `wearCount`; no representa lavado automático ni hace que una prenda deje de estar disponible. La disponibilidad se controla manualmente. El historial de la interfaz puede conservar las combinaciones; el motor sólo necesita la última fecha por prenda.

## Contrato

`src/domain/index.ts` exporta los modelos serializables, etiquetas en español, `seedWardrobe`, `createDefaultContext`, `generateRecommendations`, `swapOutfitItem` y `recordOutfitWorn`. `context.now` se entrega como fecha ISO para reproducir resultados y pruebas.

`generateRecommendations(wardrobe, context, { limit: 3 })` devuelve estado `ready`, `empty` o `insufficient`, mensajes y combinaciones con razones/advertencias. Los identificadores de combinaciones dependen de los identificadores ordenados de sus prendas. La misma entrada produce el mismo resultado. La escasez devuelve menos alternativas; nunca agrega prendas imaginarias.

`swapOutfitItem(outfit, slot, itemId, wardrobe, context)` cambia sólo una categoría existente. `itemId: undefined` elige la alternativa mejor puntuada. No agrega una categoría vacía ni convierte automáticamente una base de dos piezas en una prenda completa. Devuelve `unavailable` si no existe una alternativa válida o la combinación guardada quedó obsoleta.

`recordOutfitWorn(wardrobe, outfit, now)` devuelve `{ status, wardrobe, message }`. Revalida los identificadores, la base completa y disponibilidad contra el guardarropa actual. Una instantánea de historial con prendas eliminadas o no disponibles no puede registrarse. La interfaz debe guardar el `wardrobe` devuelto sólo si el estado es `recorded`. Registrar dos veces cuenta como dos usos; la interfaz controla la acción explícita de registrar.

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
