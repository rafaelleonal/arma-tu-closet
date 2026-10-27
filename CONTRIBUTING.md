# Contribuir

El proyecto busca aprender desarrollo móvil y probar una experiencia con ropa propia. Los cambios deben resolver un problema observable o un objetivo de aprendizaje explícito. [README](README.md) describe la versión disponible y [ROADMAP](ROADMAP.md) las posibilidades posteriores.

## Preparar el entorno

1. Usa Node.js y pnpm; el entorno comprobado es Node 24.12.0 / pnpm 10.33.2.
2. Ejecuta `pnpm install --frozen-lockfile` para instalar el árbol fijado en `pnpm-lock.yaml`.
3. Ejecuta `pnpm web` para revisar la app o `pnpm start` para iniciar Expo y elegir un destino móvil.

No hay servicios externos, secretos ni `.env` requeridos. Los scripts `ios` y `android` dependen de que hayas preparado el simulador, emulador o dispositivo; no instalan esas herramientas.

Si cambias dependencias de Expo/React Native, usa versiones compatibles con el SDK y revisa `npx expo install --check`. No fuerces una actualización o un downgrade de una dependencia transitiva sin comprobar sus efectos. Conserva `pnpm-lock.yaml`; no generes `package-lock.json`.

## Preparar un cambio

Describe el problema, el comportamiento esperado y cómo comprobarlo. Mantén cada entrega centrada en una intención; no mezcles una corrección con reorganizaciones extensas. Antes de modificar datos o reglas, revisa [arquitectura](docs/arquitectura.md), [recomendaciones](docs/recomendaciones.md) y los [ADRs](docs/adr/README.md).

TypeScript usa modo estricto. Conserva funciones de dominio independientes de React y los efectos de almacenamiento en su módulo. Reutiliza las paletas y controles existentes. Extrae componentes cuando reduzcan complejidad real; no añadas una capa solo por anticipar necesidades futuras.

Para textos y diseño, usa español concreto e inclusivo, sin inferir género ni hacer promesas sobre IA. Añade instrucciones donde eviten errores y elimina las que solo repitan un encabezado. Un tema cambia la interfaz; no altera el vestuario. Mantén fotos originales separadas de las ilustraciones.

## Validación proporcional al cambio

| Cambio | Comprobación mínima relevante |
|---|---|
| Documentación | Revisar rutas/enlaces, comandos contra `package.json` y afirmaciones contra código o evidencia fechada. No necesita exportación ni tests de UI. |
| Dominio o reglas | `pnpm typecheck` y `pnpm test`; añadir o adaptar una regresión que pruebe el comportamiento, con fecha explícita y casos límite. |
| Esquema o persistencia | Lo anterior, más migración/ida y vuelta sin pérdida de datos y recorrido real de guardar, cerrar/recargar y recuperar en la plataforma afectada. |
| Componentes, temas o copy | `pnpm typecheck` y revisión visual/interactiva de las pantallas afectadas. Ejecutar tests existentes cuando cambien contratos, estilos funcionales o contraste. No crear tests que solo dupliquen etiquetas. |
| Dependencias, recursos o empaquetado | Comprobaciones anteriores según el área y `npx expo export --platform all`; revisar los tres destinos y la inclusión de recursos. |
| Cámara, permisos o archivos nativos | Prueba en iOS/Android afectados, incluyendo permiso denegado, cancelar y reiniciar. Web y exportación no acreditan estos comportamientos. |

Comandos disponibles:

```bash
pnpm typecheck
pnpm test
pnpm export:web
npx expo export --platform all
```

Actualmente no hay script de lint ni CI configurada en el proyecto. No reportes comprobaciones que no existen o que no ejecutaste. Si una prueba no puede ejecutarse, deja el motivo y el alcance sin verificar. Evita repetir todas las comprobaciones si no cambió código desde el último resultado pertinente.

## Recorrido manual de referencia

Usa un clóset de QA y fotos sintéticas. En web, un origen separado permite conservar el clóset habitual; documenta qué host y puerto usaste. No borres datos de la persona para preparar un caso.

1. Completar onboarding sin nombre ni estilos; probar la elección de demo y la de clóset propio vacío por separado.
2. Agregar arriba + abajo + calzado, o prenda completa + calzado. Confirmar que el clóset persiste después de cerrar y volver a abrir.
3. Cambiar temperatura, lluvia y ocasión; verificar que las sugerencias y advertencias corresponden a las prendas declaradas.
4. Excluir un color y desactivar una prenda; comprobar que las nuevas sugerencias y los intercambios respetan ambos límites.
5. Cambiar una pieza, guardar y registrar uso. Guardar no aumenta usos; repetir el registro del mismo conjunto el mismo día no lo duplica en la UI.
6. Revisar el comportamiento con un clóset insuficiente y con un guardado cuya prenda dejó de estar disponible.
7. Revisar los temas, explicaciones desactivadas y tamaños estrechos. Probar foto, teclado, áreas seguras y permisos en teléfono cuando el cambio los afecte.

Selecciona los pasos que cubran el cambio. Guarda capturas útiles en `docs/evidence/`, sin datos personales, y distingue viewport web de teléfono real. Registra evidencia nueva en `docs/evaluacion.md` con fecha y entorno; conserva los resultados anteriores como históricos.

## Presentar la entrega

Si trabajas mediante una rama o pull request, usa un nombre descriptivo y un cambio acotado. El proyecto no prescribe todavía una estrategia de ramas ni un flujo de releases automatizado. Para una entrega local, proporciona la misma información que en la revisión:

- Problema concreto y comportamiento final.
- Motivo de la solución y cualquier alternativa relevante descartada.
- Comandos ejecutados y resultados; capturas o recorrido cuando hay UI.
- Migraciones, límites o comprobaciones pendientes.
- Documentación actualizada y ADR enlazado cuando corresponda.

No marques como terminada una fase del roadmap solo por una compilación exitosa. Su criterio de salida debe tener evidencia.

## Documentar decisiones

Un ADR recoge una decisión estructural difícil de cambiar o con consecuencias amplias. Una corrección de copy, una paleta o un componente nuevo no necesitan ADR. Usa la convención y los campos de [docs/adr/README.md](docs/adr/README.md).

El roadmap contiene hipótesis futuras; Open-Meteo y OpenAI tienen alcance documentado en ADR-004, mientras nube y pagos siguen pendientes. Al elegirlos, documenta el problema que resuelven, los costos y las alternativas reales.

No añadas secretos, fotos personales, artefactos generados de build ni paquetes instalados al control de versiones. La licencia de distribución aún no está definida; cualquier publicación debe resolverla expresamente.

## Pruebas de integraciones

- Ejecuta tests de clima y servidor: respuestas incompletas, cancelaciones, ciudad cambiada, caché caducada, límites de imágenes, orígenes y fallos del proveedor.
- Recorre ciudad → Automático → recarga → Manual y confirma que se conservan ambos contextos.
- Recorre foto sintética → Analizar → corregir propuesta → confirmar atributos → guardar → recarga. Cancelar o cambiar foto debe invalidar respuestas anteriores.
- Usa inyección de un proveedor falso en tests; no añadas un modo falso al servidor de uso normal. Marca esa evidencia como simulada. Una llamada real necesita una clave local y no debe imprimirla ni registrar las imágenes.

## Revisión de interacción móvil

Usa la [guía de iPhone](docs/prueba-iphone.md) para cámara, denegación y recuperación de permisos, cierre/reapertura y vibración. Las animaciones deben respetar Reducir movimiento y conservar el área táctil. Un haptic de éxito requiere escritura confirmada; no agregar vibración a cada pulsación. El proyecto (SDK 58) abre directamente en Expo Go actual; `scripts/prepare-expo-go-preview.mjs`, que preparaba una copia SDK 54, queda como histórico. Expo Go no sustituye una build propia.
