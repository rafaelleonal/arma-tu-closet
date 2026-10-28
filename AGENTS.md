# Instrucciones para agentes

## Alcance y contexto

Estas instrucciones aplican a todo el repositorio. La petición actual del usuario determina el alcance del trabajo. El proyecto es un prototipo Expo para aprender móvil y explorar la utilidad de un clóset personal; no hay un SaaS publicado.

Antes de cambiar código, lee [README.md](README.md), el documento del área afectada y los [ADRs vigentes](docs/adr/README.md). Consulta [ROADMAP.md](ROADMAP.md) para situar el cambio: sus fases son propuestas, no autorización para implementarlas todas. Usa [docs/evaluacion.md](docs/evaluacion.md) como evidencia fechada y verifica el estado mutable en código.

## Forma de trabajar

- Comunica en español. Conserva identificadores de código en inglés y el texto visible en español.
- Haz cambios concretos dentro de la petición, revisa el resultado y completa las comprobaciones relevantes. No añadas backend, proveedores, telemetría o dependencias por anticipación.
- Respeta cambios existentes y datos locales. No reinicies el clóset ni borres fotos para resolver un error de carga o de QA.
- Usa `pnpm` y conserva `pnpm-lock.yaml`. No edites `node_modules/`, `.expo/` ni `dist/` como fuentes.
- Al incorporar una dependencia nativa, comprueba su compatibilidad con el SDK instalado. Prefiere las capacidades de Expo que ya están disponibles.
- Si el usuario solicita varios agentes, prioriza GPT-6.1 Sol salvo otra indicación. Delimita archivos o responsabilidades para evitar escrituras simultáneas; el agente principal revisa e integra las entregas. No presentes la finalización de un agente como verificación independiente.

## Límites de arquitectura

| Área | Responsabilidad |
|---|---|
| `src/domain/` | Funciones puras, tipos serializables y contexto explícito. Sin React, red, permisos, almacenamiento ni reloj interno para puntuar. |
| `src/storage/` | Validación, migración, escritura y persistencia de fotos por plataforma. |
| `src/components/` y `App.tsx` | Interacción, estado de presentación y coordinación de acciones. Evita duplicar reglas de dominio. |
| `src/weather/` y `src/ai/` | Adaptadores de red y validación. La IA solo devuelve propuestas; no guarda prendas. |
| `server/` | Clave y llamada al proveedor; límites de origen, tamaño, tiempo y uso. Solo loopback en este prototipo. |
| `src/theme/` | Roles de color de la interfaz. No decide preferencias de vestuario. |
| `assets/garments/` | Ilustraciones incluidas en la app y registro de su generación. |
| `assets/demo/` | Fotos recortadas del clóset de ejemplo, con autor, enlace y licencia de cada una. |

Mantén la separación al extraer partes de `App.tsx`; no crees una nueva arquitectura completa para una corrección puntual.

## Reglas que se deben conservar

1. Las sugerencias y los intercambios solo utilizan prendas actuales, disponibles y sin ningún color excluido. Un color preferido no anula una exclusión. El compositor manual permite elegir prendas disponibles por decisión explícita de la persona.
2. La base válida es arriba + abajo + calzado, o prenda completa + calzado. Puede añadir una capa y un accesorio. No inventes piezas para completar un clóset insuficiente.
3. La rotación, ocasión, abrigo y afinidad de estilo son señales flexibles. La escasez puede producir repeticiones o advertencias. No infieras género ni atributos no visibles de una foto. La IA puede proponer nombre, categoría y colores con confirmación explícita.
4. La afinidad de estilo usa etiquetas explícitas. Los temas visuales no cambian la puntuación. Ocultar explicaciones no oculta advertencias necesarias.
5. Guardar un conjunto no registra uso. El uso se confirma con el clóset actual; la UI evita duplicarlo para el mismo conjunto en el mismo día local. El dominio recibe la fecha, y la ventana de rotación usa días transcurridos de 24 horas.
6. Los datos de ejemplo requieren una elección explícita. Un clóset propio vacío sigue vacío. Volver a personalizar conserva prendas, fotos, guardados e historial.
7. Clima manual debe identificarse como manual. No presentes reglas como IA ni una ilustración genérica como foto o reconstrucción de una prenda.

## Persistencia y fotos

- La versión del documento es `3`; la clave sigue siendo `@arma-tu-outfit/v1`. No cambies la clave para introducir un nuevo esquema.
- Añade una migración validada si cambia el formato. Comprueba preservación de identificadores, fotos, preferencias, disponibilidad, guardados e historial, incluyendo un clóset vacío.
- Los datos inválidos o de versión desconocida deben producir un error recuperable, sin sustituirlos por valores iniciales.
- Respeta la carga inicial, la cola de escrituras y los avisos de éxito posteriores al guardado. Un error de escritura no debe presentarse como éxito.
- El límite web se comprueba sobre el documento completo. No elimines esa protección para acomodar una imagen de prueba.
- Las fotos de usuario no reciben el tintado de las ilustraciones. Solo la acción explícita Analizar foto puede enviarlas al servidor local y a OpenAI; seleccionar una foto no autoriza un envío automático. Utiliza imágenes sintéticas o de ejemplo para QA y evita incluir fotos personales en evidencia, registros o commits.

## Interfaz y contenido

- Texto breve: nombres, acciones e instrucciones que ayuden a decidir. Evita eslóganes, adjetivos promocionales y descripciones que solo repitan el título.
- Personalización con roles compartidos, siguiendo [la guía de diseño](docs/diseno-personalizacion.md). Revisa todos los temas cuando cambies colores; verifica Medianoche de forma visual.
- Mantén etiquetas accesibles, estados seleccionados, áreas táctiles y controles utilizables en pantallas estrechas. Una prueba de contraste no sustituye la revisión de foco, teclado y lector de pantalla.
- Sigue [la familia de ilustraciones](assets/garments/README.md): una tinta, fondo transparente, trazos redondos y caras pequeñas. Usa archivos locales y registra los prompts de nuevos recursos. Los colores de la prenda se muestran aparte.

## Comprobaciones y entrega

Sigue la matriz de [CONTRIBUTING.md](CONTRIBUTING.md). Para cambios de lógica o almacenamiento, prueba invariantes y regresiones; no añadas tests que solo repitan el texto de la implementación. Para UI, inspecciona el resultado real además del análisis estático. En un cambio documental, comprueba rutas, enlaces y correspondencia con código; no hace falta reconstruir la app.

Reporta qué cambió, por qué, qué comandos o recorridos se ejecutaron y qué quedó sin verificar. Distingue siempre tests, exportación, navegador y dispositivo nativo. No declares probado iOS o Android solo porque se exportó un bundle.

Actualiza la documentación afectada en la misma entrega. Registra un ADR solo cuando cambien límites estructurales, persistencia, contratos centrales o dependencias difíciles de revertir. Ajustes de copy, paletas, componentes y reglas puntuales pertenecen a sus guías o a la descripción del cambio.

## Integraciones

- Conserva el clima manual al usar Open-Meteo; no sobrescribas sus valores con la caché. Descarta resultados de otra ciudad o de peticiones canceladas. Datos caducados deben mostrar su respaldo manual.
- No incluyas secretos en Expo, logs, fixtures ni capturas. `.env.server` es local e ignorado. No expongas el proxy local a Internet sin autenticación y límites por usuario.
- El análisis de foto no guarda ni confirma atributos. Diferencia tests con proveedor simulado de inferencia real.
