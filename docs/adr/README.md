# Decisiones de arquitectura

Estos ADRs documentan las decisiones estructurales ya implementadas en el prototipo. Se registraron el 23/10/2026 a partir del código y del objetivo del proyecto. Las alternativas describen el razonamiento de esta revisión; no implican que se hayan construido o medido prototipos de cada una.

| ADR | Decisión | Estado |
|---|---|---|
| [001](0001-react-native-expo.md) | React Native y Expo como base móvil compartida | Aceptada para el prototipo |
| [002](0002-persistencia-local.md) | Datos locales versionados y fotos por plataforma | Aceptada para el prototipo |
| [003](0003-recomendador-local.md) | Recomendador local determinista con contexto explícito | Aceptada para el prototipo |
| [004](0004-servicios-externos-opcionales.md) | Clima automático y análisis opcional con confirmación | Aceptada para el prototipo local; «No pedir GPS» sustituido por ADR-005 |
| [005](0005-ubicacion-para-elegir-ciudad.md) | Ubicación aproximada, solo al pulsar, para elegir la ciudad del clima | Aceptada para el prototipo local |
| [006](0006-recorte-de-fondo-en-dispositivo.md) | Recorte de fondo en el dispositivo con un módulo local y build de desarrollo | Aceptada para el prototipo local (iOS) |
| [007](0007-estructura-del-front-y-reglas-de-lint.md) | Pantallas, hooks y componentes separados; límites de arquitectura y tamaño con ESLint | Aceptada para el prototipo |

## Cuándo crear un ADR

Registrar una decisión cuando cambie una frontera importante del sistema, el modo de conservar datos, un contrato central o una dependencia costosa de sustituir. Ejemplos futuros: introducir sincronización remota, cambiar la fuente del recomendador o necesitar código nativo que altere el flujo de desarrollo.

Ajustes de texto, paletas, ilustraciones, componentes y pesos concretos del ranking se explican en la guía correspondiente o en la entrega. Las fases propuestas pertenecen al [roadmap](../../ROADMAP.md); no tienen estado de decisión aceptada.

## Convención

Crear `NNNN-titulo-breve.md` con el siguiente número disponible. Incluir:

- Fecha y estado: propuesta, aceptada, rechazada o sustituida.
- Contexto y problema que exige decidir.
- Decisión y alcance concreto.
- Alternativas y motivos de descarte.
- Consecuencias favorables y costos asumidos.
- Condiciones para revisarla y enlaces al código/evidencia.

Si cambia una decisión, crear un nuevo ADR y marcar el anterior como sustituido con enlace al sucesor. Conservar el contexto original; corregir errores factuales de forma explícita. La aceptación corresponde a una decisión dentro del alcance acordado del proyecto, no a una aprobación automática de todo el roadmap.
