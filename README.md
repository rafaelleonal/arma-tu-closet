# Arma tu outfit

App para elegir qué ponerse con la ropa del propio clóset. Es un proyecto individual para aprender desarrollo móvil y comprobar si las sugerencias ayudan en el día a día.

**Estado:** prototipo funcional de Expo con datos locales. Sin cuentas ni publicación en tiendas. Incluye un servidor local opcional para analizar prendas. La utilidad del producto y la disposición a pagar todavía no se han validado.

## Qué puedes hacer

- Ver una bienvenida breve y elegir estilos, colores preferidos, colores a evitar y ciudad del clima en un onboarding de cuatro pasos; continuar sin completar las preferencias opcionales.
- Activar o desactivar la vibración en móvil; las transiciones respetan Reducir movimiento.
- Personalizar la apariencia con los temas Lino, Papel, Medianoche, Salvia, Chicle y Malva, vista Amplia o Compacta y explicaciones opcionales.
- Agregar prendas con lo esencial (categoría y colores; foto y nombre opcionales) y ajustar en **Más detalles** ocasiones, abrigo, lluvia y estilos. Editar también la disponibilidad.
- Obtener hasta tres sugerencias con clima automático de Open-Meteo o clima manual, y la ocasión elegida; cambiar una prenda o pedir otra combinación.
- Armar conjuntos por categorías, guardarlos y registrar cuándo los usaste. Guardar y usar son acciones distintas.
- Ver tu ropa en **Mi clóset** como cuadrícula de fotos; el clóset de ejemplo y la bienvenida usan un perchero donde la prenda elegida gira de frente.
- En iOS 17+ con la build de desarrollo, **Quitar fondo** recorta la foto de una prenda en el teléfono y conserva la original ([ADR-006](docs/adr/0006-recorte-de-fondo-en-dispositivo.md)).
- Conservar el clóset, preferencias, fotos y uso en el dispositivo. Puedes empezar con ropa propia o elegir una demo identificada como ejemplo, con fotos de prendas recortadas ([créditos](assets/demo/README.md)).

Las ilustraciones son dibujos genéricos. Puedes analizar una foto con IA para proponer nombre, categoría y colores: revisas y confirmas la propuesta antes de incorporarla al formulario, y guardas la prenda por separado. Los demás atributos siguen siendo manuales.

## Empezar

Entorno usado en la validación del 27/10/2026: **Node.js 24.12.0 y pnpm 10.33.2**. Es la combinación comprobada, no una declaración de versión mínima. El clóset y Open-Meteo funcionan sin claves. El análisis opcional necesita un servidor local y una clave de OpenAI que nunca se incluye en Expo.

```bash
pnpm install --frozen-lockfile
pnpm start
```

Opciones de desarrollo:

| Comando | Uso |
|---|---|
| `pnpm web` | Vista web de desarrollo con Metro. |
| `pnpm ios` | Iniciar Expo y solicitar apertura en iOS; requiere el entorno o dispositivo correspondiente. |
| `pnpm android` | Iniciar Expo y solicitar apertura en Android; requiere el entorno o dispositivo correspondiente. |

Usa la URL que indique Expo. En navegador, `localhost` y `127.0.0.1` tienen almacenamientos independientes: cambiar de origen puede mostrar un clóset distinto. Para el iPhone, el proyecto abre directamente en Expo Go de App Store; sigue la [guía de prueba](docs/prueba-iphone.md). La copia temporal SDK 54 que se usó antes queda como histórica.

Para probar el flujo: completa el onboarding, elige **Usar clóset de ejemplo** o **Empezar con mi ropa**, revisa **Hoy** y cambia una prenda. Con ropa propia necesitas arriba + abajo + calzado, o una prenda completa + calzado. Las preferencias se editan en **Mi estilo → Editar preferencias**.

## Clima y análisis de fotos

En **Hoy → Cambiar → Automático** (o en el paso Tu rutina del onboarding), pulsa **Usar mi ubicación** en iOS/Android o busca la ciudad por nombre. El permiso de ubicación se pide solo al pulsar el botón; se guarda la ciudad, no tu posición, y no hay seguimiento en segundo plano. La app actualiza el clima al abrirse y cada 30 minutos mientras está activa; muestra la hora y usa la sensación térmica para ordenar conjuntos. Un dato de tres horas o más deja de usarse: vuelve al clima manual de respaldo. No promete pronóstico para todo el día. [ADR-005](docs/adr/0005-ubicacion-para-elegir-ciudad.md).

Para habilitar el análisis:

```bash
cp .env.server.example .env.server
# Edita .env.server y configura OPENAI_API_KEY sin publicarla.
pnpm server
# En otra terminal:
pnpm web
```

El servidor escucha en `127.0.0.1:8787`. En navegador local no hace falta `.env`; [.env.example](.env.example) permite indicar `EXPO_PUBLIC_AI_API_URL`. Nunca coloques una clave en una variable `EXPO_PUBLIC_`. En un dispositivo físico, `127.0.0.1` es el propio teléfono: esta versión requiere un reenvío local de puerto; no está preparada para exponer el servidor públicamente. Detalles y límites en [integraciones](docs/integraciones.md).

En **Agregar prenda**, elige una foto y pulsa **Analizar foto**. La imagen solo sale del dispositivo tras esa acción. Revisa, corrige y confirma los atributos propuestos; después guarda la prenda. El alta manual sigue disponible si no hay servidor, clave o conexión.

## Build de desarrollo (iOS)

Expo Go no incluye el módulo de recorte. Para probar **Quitar fondo** se necesitan Xcode y CocoaPods (por ejemplo `brew install cocoapods`):

```bash
npx expo run:ios
```

El comando genera `ios/` (no se versiona), compila e instala la app en el simulador o teléfono. En Expo Go, web y Android el resto de la app funciona y el botón no aparece.

En el simulador el botón aparece, pero Vision no puede ejecutar el recorte y la app muestra «No pudimos quitar el fondo de esta foto.». El recorte se prueba en un iPhone con iOS 17 o posterior. Si arrancas Metro aparte (`npx expo start --dev-client`), no uses `CI=1`: desactiva la vigilancia de archivos y la app recibe código viejo.

## Por qué está construido así

| Decisión | Motivo | Costo o límite |
|---|---|---|
| React Native + Expo + TypeScript | Aprender móvil y compartir el núcleo entre iOS y Android con herramientas para cámara, archivos y desarrollo. | El comportamiento nativo requiere pruebas propias; web no lo demuestra. [ADR-001](docs/adr/0001-react-native-expo.md). |
| Persistencia local versionada | Entregar el primer circuito sin cuenta, red ni operación de un servidor. | Sin sincronización ni respaldo; un documento JSON completo no es la solución para cualquier escala. [ADR-002](docs/adr/0002-persistencia-local.md). |
| Servicios externos opcionales | Open-Meteo aporta contexto; OpenAI reduce escritura de atributos visibles con revisión humana. | Dependencia de red, costo de IA y servidor local. [ADR-004](docs/adr/0004-servicios-externos-opcionales.md), [ADR-005](docs/adr/0005-ubicacion-para-elegir-ciudad.md). |
| Recomendador determinista separado de la UI | Comprobar restricciones y entender por qué se propone cada combinación antes de añadir un modelo. | Las reglas no aprenden gustos y su búsqueda es acotada. [ADR-003](docs/adr/0003-recomendador-local.md). |

El proyecto usa Expo SDK 58, React Native 0.88 y React 19.3; las versiones exactas están en [package.json](package.json) y [pnpm-lock.yaml](pnpm-lock.yaml). Los cambios de dependencias deben conservar la compatibilidad del SDK.

La personalización toma a Revolut como referencia y la claridad de la experiencia toma a Resend. Son criterios de producto, no componentes copiados. La interfaz usa texto breve y roles de color compartidos; las nueve ilustraciones de una tinta siguen las referencias de Café Sinónimo aportadas para el proyecto. Esto da una familia visual coherente sin confundir el color del tema con el de la prenda. Véanse [diseño](docs/diseno-personalizacion.md) e [ilustraciones y prompts](assets/garments/README.md).

## Organización

```text
App.tsx                 Pantallas principales, estado y coordinación
src/components/         Onboarding, formularios, conjuntos y controles
src/domain/             Tipos y reglas puras de recomendaciones
src/storage/            Esquema, migración, escritura local y fotos
src/weather/            Cliente Open-Meteo, caché y contexto derivado
src/ai/                 Contrato y cliente de análisis de prendas
server/                 Proxy local de OpenAI sin persistencia de fotos
src/theme/              Paletas y proveedor de apariencia
assets/garments/         Ilustraciones locales y prompts
tests/                 Pruebas de dominio, esquema y contraste
docs/                  Producto, arquitectura, decisiones y evidencia
```

El dominio recibe prendas y contexto explícito; no depende de React, almacenamiento ni red. La UI coordina las acciones y la persistencia valida los datos antes de escribir. Detalle en [arquitectura](docs/arquitectura.md).

## Verificación y límites

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm export:web
# Para incluir los tres destinos:
npx expo export --platform all
```

**Última evidencia de implementación, 27/10/2026:** 76 pruebas aprobadas, TypeScript sin errores y exportación de bundles web/iOS/Android con SDK 58. Hubo recorridos en navegador y en el simulador de iOS con Expo Go; la evidencia del 23/10/2026 incluye persistencia tras recarga y revisión visual a 390 y 320 px. [Resultados y capturas](docs/evaluacion.md).

La exportación no genera binarios firmados ni acredita funcionamiento en un teléfono. Quedan pendientes cámara, permisos, teclado, lector de pantalla y persistencia nativa después de cerrar la app. Los avisos de dependencias registrados también deben reevaluarse antes de distribuirla.

Límites actuales que afectan el uso:

- Sin copia de seguridad ni sincronización. Borrar datos del navegador o desinstalar la app puede eliminar el clóset.
- El esquema v3 migra v1/v2 y conserva la clave `@arma-tu-outfit/v1` para migrar datos existentes; un documento inválido no se reemplaza por la demo.
- En web, el JSON completo —incluidas fotos— tiene un límite interno de 2 millones de caracteres; no equivale a la cuota garantizada del navegador. En móvil, las fotos se copian al directorio de documentos de la app. Los archivos que quedan sin referencias aún no se limpian automáticamente.
- No hay deshacer uso ni edición del historial. Los guardados conservan una instantánea; registrar uso revalida las prendas actuales. El compositor elige categorías, no es un lienzo para arrastrar prendas.
- Sin tendencias, compras, pagos ni aprendizaje de gustos. La IA solo asiste en nombre, categoría y colores de una prenda. Las restricciones de colores aplican a sugerencias e intercambios; el armado manual permite elegir entre las prendas disponibles.

## Documentación y próximos pasos

- [Prueba en iPhone](docs/prueba-iphone.md): conexión, cámara, permisos, vibración y cierre/reapertura.
- [Evaluación UI/UX](docs/uiux-evaluacion.md): antes y después, evidencia y límites.
- [Cuentas y datos](docs/cuentas-y-datos.md): propuesta de acceso, propiedad, respaldo y sincronización.
- [Plan de despliegue](docs/deploy-plan.md): alojamiento, costos, TestFlight y Google Play.
- [CONTRIBUTING](CONTRIBUTING.md): cómo preparar, comprobar y presentar cambios.
- [AGENTS](AGENTS.md): instrucciones de trabajo para agentes en este repositorio.
- [ROADMAP](ROADMAP.md): siguientes fases posibles, dependencias y criterios de avance.
- [ADRs](docs/adr/README.md): decisiones estructurales y motivos para revisarlas.
- [Producto](docs/producto.md): hipótesis y propuesta de piloto; no representa funciones entregadas.
- [Recomendador](docs/recomendaciones.md): contrato, reglas y límites de búsqueda.

El proyecto está marcado como privado en `package.json` y no incluye una licencia de distribución. Esa decisión queda pendiente antes de abrirlo a terceros.
