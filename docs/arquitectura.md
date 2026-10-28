# Arquitectura y recorrido de aprendizaje

Actualizado: 23 de octubre de 2026. Prototipo local para aprender móvil y evaluar la experiencia; no es todavía un SaaS publicado. Los motivos, alternativas y condiciones de revisión de las decisiones estructurales están en los [ADRs](adr/README.md); las fases posibles están en [ROADMAP](../ROADMAP.md).

## React Native con Expo

La cámara/galería, las preferencias, un catálogo personal y recomendaciones locales caben en React Native con Expo. React Native recomienda un framework como Expo para proyectos nuevos, y Expo permite incorporar módulos nativos cuando aparezca una necesidad concreta. No hay un requisito actual que justifique dos aplicaciones independientes en Swift y Kotlin.

Fuentes verificadas: [React Native: comenzar un proyecto](https://reactnative.dev/docs/environment-setup), [Expo: flujo de desarrollo](https://docs.expo.dev/workflow/overview/), [Expo: development builds](https://docs.expo.dev/develop/development-builds/faq/).

Expo Go permite empezar a probar; una development build permite controlar el binario y sus dependencias nativas. Un bundle o una vista web no demuestra que cámara, permisos, teclado y archivos funcionen en un teléfono. Esas pruebas se registran por separado.

## Límites del diseño

- **Dominio:** tipos serializables y reglas puras en `src/domain`. Recibe prendas y contexto explícito; devuelve conjuntos, motivos y advertencias. No consulta red, UI ni almacenamiento.
- **Aplicación:** las pantallas permiten cambiar el contexto, agregar prendas, elegir combinaciones y confirmar uso. Guardar un conjunto no cuenta como haberlo usado. `App.tsx` solo elige entre carga, onboarding y pestañas; cada pestaña vive en `src/screens/`, y la carga, el guardado y las sugerencias en `src/hooks/`. Las pantallas reciben el documento y una función `update`; no hay estado global. ESLint comprueba estos límites y el tamaño de cada pieza ([ADR-007](adr/0007-estructura-del-front-y-reglas-de-lint.md)).
- **Persistencia:** almacenamiento local con carga inicial antes de escribir. Una instalación nueva empieza sin prendas. Los datos de ejemplo se incorporan solo al elegir la demo; no deben reemplazar un clóset existente o vacío.
- **Fotos:** se seleccionan con permisos del sistema. Las referencias temporales del selector requieren persistencia adecuada a la plataforma. Una acción explícita puede enviarlas al servidor local y a OpenAI para proponer nombre, categoría y colores. La persona revisa antes de aplicar y guarda por separado.
- **Contexto:** temperatura y lluvia manuales o contexto derivado de Open-Meteo para la ciudad seleccionada. La caché caduca a las tres horas y el respaldo manual se conserva. Una estación del año no sustituye la temperatura real.

La disponibilidad y los colores excluidos son restricciones. Clima, ocasión y rotación ayudan a ordenar las opciones; cuando el clóset no alcanza, se debe explicar la limitación. La rotación es flexible para que un clóset pequeño pueda seguir siendo útil.

## Servicios opcionales

`src/weather` valida las respuestas y deriva el contexto sin modificar los valores manuales. La UI refresca al recuperar actividad y controla peticiones en curso. `src/ai` comparte un contrato estricto con `server`: el proxy llama al proveedor y devuelve atributos corregibles. No almacena fotos ni crea prendas. Véase [configuración y límites](integraciones.md).

El esquema v3 agrega `weather` con migración desde v1/v2 en la misma clave; conserva el inventario, fotos, guardados y preferencias.

## Personalización local

El esquema v2 añadió `profile`, `appearance` y progreso de `onboarding`. `parseLocalData` migra v1 conservando todos sus campos, incluida la finalización del alta; utiliza la misma clave `@arma-tu-outfit/v1`. Versiones desconocidas o documentos inválidos producen un error recuperable, sin reemplazar el clóset.

`ThemeProvider` aplica roles de color compartidos en pantallas, hojas, campos y controles. Las paletas están separadas de los colores reales de las prendas. La preferencia visual nunca llega al motor de recomendaciones. Los estilos del perfil sí llegan como contexto y se comparan solo con etiquetas explícitas de las prendas; no se deducen desde fotos ni género.

El onboarding persiste decisiones y paso al avanzar. En una instalación existente, volver a personalizar aplica cambios al momento y conserva el inventario; la elección demo/propio solo existe al completar el alta inicial.

## Orden para aprender y evolucionar

1. **Recorrer el prototipo en el teléfono:** componentes de React Native, áreas seguras, teclado, permisos y diferencias entre plataformas. Identificar un problema de uso real antes de añadir pantallas.
2. **Comprender el estado:** seguir una prenda desde el formulario hasta el almacenamiento y el recomendador; cambiar una regla y comprobar su efecto con pruebas del dominio.
3. **Probar ropa propia:** cargar pocas prendas, elegir un conjunto, cambiar una pieza y confirmar su uso. Revisar si las sugerencias siguientes tienen sentido.
4. **Mejorar confiabilidad local:** recuperación y respaldo, edición, errores de almacenamiento, archivos de fotos y accesibilidad en dispositivos reales.
5. **Agregar un servicio externo cuando aporte valor:** pronóstico con ciudad opcional, hora de actualización, caché y alternativa manual. El aprendizaje aquí incluye fallos de red y estados de carga.
6. **Explorar SaaS después de observar uso:** cuentas y sincronización si hacen falta, almacenamiento privado, costos por usuario, observabilidad y distribución. La suscripción es una hipótesis comercial, no una consecuencia automática de crear la app.
7. **Explorar visión y referencias:** extracción de atributos con confirmación de la persona, métricas de error y costos. Las sugerencias deben seguir apuntando a prendas reales; las compras requieren distinguir claramente inventario propio y catálogo externo.

## Decisiones que se posponen

Open-Meteo y un proxy local de OpenAI se incorporan en [ADR-004](adr/0004-servicios-externos-opcionales.md). Cuentas, sincronización, despliegue público, pagos y afiliación siguen pendientes. La lógica de recomendaciones queda separada para poder usarla en un servicio futuro y comparar reglas con otros métodos sin reescribir la interfaz.

El prototipo usa una sola colección local; no ofrece sincronización ni garantía de respaldo. La futura política de privacidad debe describir la implementación real cuando exista almacenamiento remoto.

## Evolución planificada

La [propuesta de cuentas y datos](cuentas-y-datos.md) describe acceso opcional, SQLite, migración, propiedad y sincronización. El [plan de distribución](deploy-plan.md) define alojamiento, entornos y tiendas. Ambos están pendientes de implementación; la arquitectura vigente sigue siendo local.

`FeedbackProvider` comparte la preferencia del sistema para reducir movimiento y la preferencia opcional `appearance.hapticsEnabled`. Esta extensión compatible de v3 acepta documentos anteriores sin modificar sus valores; omitirla equivale a vibración activada en móvil. Un valor distinto de booleano se rechaza. Los avisos de éxito y haptics se emiten después de escritura confirmada.
