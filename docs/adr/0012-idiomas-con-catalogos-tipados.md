# ADR-012 — Idiomas con catálogos tipados y códigos en el dominio

- Fecha: 11/11/2026.
- Estado: aceptada para el prototipo local.
- Alcance: todo el texto visible, el dominio, los adaptadores y el documento local.

## Contexto

La app solo hablaba español y el texto vivía repartido en unos cien archivos. Además, el dominio escribía frases: los motivos («Ocasión: trabajo»), las advertencias y los mensajes de un clóset insuficiente. `reasonVoice.ts` volvía a leer esos motivos con expresiones regulares para darles la voz de las prendas. Traducir ese texto rompía la lectura, y los conjuntos guardados conservan sus motivos dentro del documento local. Los errores de clima, almacenamiento y análisis también llegaban a la interfaz como frases en español.

## Decisión

- **Catálogos en `src/i18n/`.** `es.ts` es la fuente y `en.ts` tiene su misma forma: TypeScript exige cada clave y un test compara también la longitud de las listas y los parámetros de cada frase. Las frases que cambian son funciones (`count(total, available)`), con el plural escrito en cada idioma. Los componentes leen el catálogo activo con `useCopy()` (`t.today.title`). No se añade una biblioteca de traducción.
- **El idioma.** Por defecto sigue al dispositivo con `expo-localization` (el primero que la app hable; si no, español). Ajustes → Idioma permite fijar Español o English. Las fechas usan `Intl` con la región del dispositivo cuando habla ese idioma.
- **El dominio devuelve datos.** Motivos y advertencias son códigos (`occasion:work`, `warmth:22`, `worn-recently`) que se siguen guardando como texto, así que un conjunto guardado conserva su forma JSON. `parseReason` y `parseWarning` también leen las frases que se guardaron antes, de modo que esos conjuntos se muestran en el idioma activo. Los resultados sin propuesta llevan un `problem` estructurado en lugar de `message`. Categorías, ocasiones, estilos, colores, tonos y telas de la colorimetría son identificadores; sus nombres están en los catálogos.
- **Los adaptadores devuelven códigos.** Clima (`WeatherRequestError.code`), ubicación (`reason`), almacenamiento (`StorageError.code`) y análisis (`AiClientError.code` y `reason`) ya no deciden el texto. Sus mensajes en español quedan para registros y pruebas. ESLint impide que el dominio o un adaptador importen `src/i18n/`.
- **Datos guardados.** `appearance.language` es opcional en v3; sin él se sigue el dispositivo. Los identificadores de color siguen en español (`cafe`, `negro`) porque ya están en los documentos y en el contrato del análisis. Los nombres que escribe la persona no se traducen. Las prendas de ejemplo reciben el nombre del idioma activo al añadirse.
- **Servicios.** La búsqueda de ciudades pide los nombres en el idioma activo. El análisis de foto envía `Accept-Language`; el servidor local propone el nombre en inglés cuando se pide y devuelve el motivo del rechazo como código. Un backend que lo ignore sigue funcionando: el nombre llega en español y la app muestra su mensaje general.
- **Textos nativos.** `app.json` declara `locales/es.json` y `locales/en.json` para los permisos de cámara, fotos y ubicación.

## Alternativas

| Alternativa | Motivo de descarte |
|---|---|
| `i18next` con `react-i18next` | Útil con muchos idiomas o traducción externa; aquí añade una dependencia y claves en texto sin comprobar tipos. Se puede adoptar después: los catálogos ya están separados. |
| Traducir las frases del dominio en la interfaz | Mantenía el análisis con expresiones regulares en dos idiomas y dejaba al dominio decidiendo texto. |
| Guardar motivos como objetos | Cambiaba el formato de `savedOutfits` y obligaba a migrar a v4 sin beneficio para la persona. |
| Detectar el idioma solo con `Intl` | Evita la dependencia nativa, pero `expo-localization` es la capacidad de Expo prevista y también da la región para fechas. |

## Consecuencias

Agregar un idioma es escribir otro catálogo con la forma de `es.ts` y sus `locales/`. Un texto nuevo debe escribirse en ambos catálogos, o TypeScript falla. La voz de las prendas en inglés sigue sus propias reglas en [la guía de tono](../diseno-personalizacion.md#tono-de-la-app).

`expo-localization` carga un módulo nativo al importarse: la build de desarrollo instalada antes de este cambio no abre la app y hay que recompilar con `npx expo run:ios` (con `LANG=en_US.UTF-8` si CocoaPods falla por la codificación). El selector de idioma por app de iOS no se configuró.

Quedan en español los mensajes que no traen código (los del recorte nativo y algunos errores del servidor), que en inglés se sustituyen por el mensaje general de su tipo; los nombres de prendas de ejemplo ya guardados; y el selector de datos de prueba, que solo existe en desarrollo.

Revisar si se añaden más de dos idiomas, si la traducción pasa a personas externas o si un backend público necesita negociar idioma en más rutas. Código: [src/i18n](../../src/i18n/), [reasons.ts](../../src/domain/reasons.ts). Evidencia en [evaluación](../evaluacion.md).
