# Evaluación de UI y uso móvil

Fecha: 23/10/2026. Base inicial: código y capturas anteriores a la iteración de animaciones y haptics. Revisión posterior: implementación de Feedback, hojas, controles, editor y formularios, con dos capturas nuevas. Esta revisión no ejecutó la app en un iPhone ni controló el navegador. No se midieron tiempos de uso ni comprensión con personas.

## Evidencia anterior

| Captura | Qué permite revisar | Límite |
|---|---|---|
| [Clóset ilustrado](evidence/closet-ilustrado.jpg) | Jerarquía, selección de categorías, disponibilidad y navegación. | Viewport web, sin teclado ni lector de pantalla. |
| [Clima automático, 390 px](evidence/clima-automatico-390.png) | Ciudad, actualización, atribución y acceso a conjuntos en Medianoche. | No acredita clima de todo el día ni ejecución nativa. |
| [Revisión de análisis, 390 px](evidence/ia-revision-simulada-390.png) | Propuesta editable separada del formulario. La revisión ocupa varias pantallas de desplazamiento. | Proveedor simulado; no demuestra calidad de reconocimiento. |
| [Análisis sin clave, 320 px](evidence/ia-sin-clave-320.png) | Error recuperable, reintento y formulario manual disponible. | No representa denegación de cámara en iOS. |

Las capturas de esta tabla son el **antes**. No se sustituyen por mockups. Las capturas posteriores y los recorridos reportados se identifican al final.

## Lo que ya funciona en el flujo

La navegación tiene tres destinos con nombres visibles. Las fotos son opcionales; seleccionar una no inicia el envío a OpenAI. El análisis propone únicamente nombre, categoría y colores, permite corregirlos y exige aplicar antes de incorporarlos al formulario. Guardar la prenda sigue siendo otra acción. Una respuesta antigua se descarta al cambiar foto, cerrar o cancelar.

El código confirma guardados después de resolver la escritura local y muestra un error si falla. Guardar conjuntos y registrar uso siguen separados. Hay teclado evitado en iOS, controles principales de al menos 44 puntos y advertencias independientes de las explicaciones opcionales. Son propiedades del código; su manejo con VoiceOver, texto ampliado y teclado real sigue pendiente.

## Cuatro mejoras para esta iteración

El agente principal implementó las cuatro áreas. Esta evaluación revisó el código posterior sin modificarlo. El estado separa implementación, evidencia web y pruebas móviles pendientes.

| Prioridad y ubicación | Antes | Después revisado | Beneficio y comprobación |
|---|---|---|---|
| P1 · [ItemEditor.tsx](../src/components/ItemEditor.tsx), cierre del editor | `closeEditor` cierra y descarta lo escrito, una foto elegida o los datos aplicados del análisis. No distingue un formulario intacto de uno modificado. | **Implementado:** compara un fingerprint de los campos editables, foto incluida. Si cambió, muestra **Seguir editando** y **Descartar cambios**; si no, cierra directamente. No guarda automáticamente. | Evita perder una captura por tocar la X. Escribir, elegir foto y aplicar análisis por separado; intentar cerrar, continuar y comprobar que cada valor permanece. Confirmar descarte y reabrir sin esos cambios. |
| P1 · [ItemEditor.tsx](../src/components/ItemEditor.tsx) y [GarmentSuggestionReview.tsx](../src/components/GarmentSuggestionReview.tsx), validación | Los errores de nombre, colores u ocasión se muestran al final del bloque. El formulario y la revisión son largos; el campo que debe corregirse puede quedar fuera de pantalla. | **Implementado en el editor principal:** errores junto a nombre, colores y ocasión; desplazamiento al primero y foco si es nombre. **Parcial en revisión IA:** conserva su error al final del bloque y no enfoca el nombre propuesto. | La corrección se encuentra sin buscar por toda la hoja. Probar nombre vacío, cero colores y cero ocasiones a 320/390 px y con teclado abierto. La primera corrección debe quedar visible y el lector debe anunciar el error. |
| P2 · [ItemEditor.tsx](../src/components/ItemEditor.tsx), permiso de cámara | Solo se comprueba `granted`. Cuando el sistema ya no permite preguntar otra vez, volver a tocar Tomar foto no ofrece un camino distinto. El alta manual permanece disponible. | **Implementado en código:** consulta permiso, distingue `canAskAgain` y ofrece **Abrir Ajustes** cuando está bloqueado en móvil. Galería y campos manuales permanecen disponibles. No pide permiso al abrir el editor. **Sin probar en iPhone.** | La denegación tiene una salida explícita. Verificar en iPhone: denegar, volver a intentar, abrir Ajustes, regresar y tomar una foto; cancelar debe conservar la selección previa. Es una prueba nativa pendiente. |
| P2 · [Sheet.tsx](../src/components/Sheet.tsx), [ui.tsx](../src/components/ui.tsx) y [App.tsx](../App.tsx), respuesta a acciones | La hoja usa `slide` incondicional. Los botones solo cambian opacidad al pulsar. No hay una política compartida de movimiento o vibración. | **Implementado en código:** entrada de 180 ms, pulsación de 90/140 ms y hoja sin slide con Reducir movimiento. Haptic al cambiar pestaña, tema, paso o estilos/colores del onboarding; éxito después de escritura. Ajuste Vibración solo en móvil. No se añadió haptic a todos los chips. **Tacto y preferencia real sin verificar.** | Comunica la acción sin retrasarla ni confundir pulsación con guardado. Comparar movimiento normal/reducido; tocar varias veces la misma opción; provocar un fallo de guardado. No debe haber éxito anticipado, vibraciones repetidas por el mismo valor ni bloqueo de controles. |

Los tres primeros cambios mejoran recuperación y corrección de errores. La cuarta mejora añade respuesta física y visual; no sustituye las anteriores ni demuestra por sí sola una mejora de usabilidad.

## Animaciones y haptics

Comportamiento revisado en [Feedback.tsx](../src/components/Feedback.tsx), [Sheet.tsx](../src/components/Sheet.tsx) y sus puntos de uso:

- Entrada de contenido: `MotionIn` se activa por cambio de pestaña o paso, no por cada letra ni por cada prenda al desplazarse.
- Pulsación: escala de contenido a 0.98; el área táctil y layout permanecen en el control. La acción no espera a la animación y una pulsación nueva detiene la anterior.
- Selección: pestaña y tema solo vibran si cambian. Los estilos/colores del onboarding se alternan con feedback; un cuarto estilo rechazado no vibra. No hay vibración por letra, render o refresco meteorológico. Los chips del editor no tienen haptic.
- Guardado y uso: `success()` se invoca al resolver la escritura vigente que tiene un aviso pendiente. Aplicar una propuesta de IA no dispara ese éxito ni guarda la prenda.
- Reducir movimiento: inicia sin movimiento, consulta la preferencia y escucha cambios. Desactiva escala, desplazamiento de entrada y slide de la hoja. La preferencia no cambia el ajuste independiente de Vibración. Falta comprobarlo en Ajustes del iPhone.

React Native 0.83 ofrece `isReduceMotionEnabled` y el evento `reduceMotionChanged`. En web debe respetarse también la preferencia del navegador. [Referencia de React Native](https://reactnative.dev/docs/0.83/accessibilityinfo), [criterios de movimiento y formularios web](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

En iOS los haptics pueden no ejecutarse con cámara o dictado activos, bajo consumo o desactivación del motor por la persona. No hay que interpretar su ausencia como fallo de guardado ni añadir dependencias para forzarlos. [Expo Haptics, SDK 55](https://docs.expo.dev/versions/v55.0.0/sdk/haptics/). La recuperación de cámara debe usar el estado de permiso que expone [Expo ImagePicker](https://docs.expo.dev/versions/v55.0.0/sdk/imagepicker/#permissionresponse).

## Evidencia después del cambio

| Antes | Después | Resultado y alcance |
|---|---|---|
| Error manual al final del formulario; campo fuera de vista. | [Error junto al nombre, 390 px](evidence/formulario-error-390.png). | Inspección de captura: campo y error visibles en Medianoche. El principal reportó nombre vacío y cero colores con mensajes junto al campo, sin controlar este revisor el navegador. |
| Cerrar descartaba inmediatamente. | [Confirmación de descarte, 390 px](evidence/cambios-sin-guardar-390.png). | Inspección de captura: dos acciones diferenciadas. El principal reportó editar nombre → Cerrar → Seguir editando conservando el valor. |

Entorno de esos recorridos reportados: `localhost:8082`, Medianoche. Guardar/recargar y la nueva revisión a 320 px continuaban en curso al actualizar este documento; no se dan por aprobados aquí. Las capturas no prueban vibración, duración de transiciones ni permisos nativos.

Pendiente concreto de la revisión: la validación de [GarmentSuggestionReview.tsx](../src/components/GarmentSuggestionReview.tsx) aún no tiene la misma corrección inline/foco que el formulario principal. Se puede completar después sin cambiar la confirmación explícita de atributos.

En Expo Go en iPhone queda comprobar teclado, permiso denegado, galería, cámara, regreso desde Ajustes, análisis cancelado, confirmación de atributos y guardado seguido de cierre/reapertura. Añadir VoiceOver, texto ampliado y Reducir movimiento activado/desactivado. Cámara, tacto, accesibilidad y persistencia nativa se mantienen **sin verificar**.

La preparación de una copia temporal compatible con Expo Go es una tarea distinta. No acredita esos recorridos y no cambia la versión principal del proyecto ni sus datos locales.

### Cierre del recorrido web y pausa

El principal completó después el guardado y recarga de una prenda de QA, el cierre directo sin modificaciones y el descarte a 320 px conservando la prenda original. [Captura a 320 px](evidence/cambios-sin-guardar-320.png). El usuario pidió pausar y confirmó que todavía no probó en iPhone; se conserva ese recorrido como pendiente. Véase el registro actualizado en [evaluación](evaluacion.md).
