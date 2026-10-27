# Roadmap

Actualizado: 23 de octubre de 2026. Las fases siguientes son posibilidades, sin fechas comprometidas ni obligación de construirlas todas. La prioridad es aprender móvil y comprobar el valor de decidir qué ponerse con ropa propia. Crear un SaaS es una opción posterior.

## Punto de partida

**Implementado:** Expo con datos locales, onboarding y temas, clóset con fotos y atributos manuales o propuestos por IA con confirmación, clima Open-Meteo opcional, sugerencias por reglas, intercambio de prendas, composición por categorías, guardados y registro de uso. Esquema v3 con migración desde v1/v2 y nueve ilustraciones genéricas.

**Verificado hasta ahora:** 72 pruebas, TypeScript, exportaciones web/iOS/Android y recorridos en navegador. **Pendiente:** ejecución nativa, permisos y archivos en teléfono, utilidad cotidiana y demanda comercial. Véase [la evidencia](docs/evaluacion.md).

La iteración actual añade animaciones, vibración configurable y recuperación de errores del formulario. El 27/10/2026 el proyecto pasó a Expo SDK 58 y abre directamente en Expo Go; la [prueba de iPhone](docs/prueba-iphone.md) ya no necesita la copia temporal SDK 54.

Ya hay un [plan de cuentas y datos](docs/cuentas-y-datos.md) y un [plan de despliegue](docs/deploy-plan.md). Supabase y EAS son propuestas para esas fases, no infraestructura desplegada.

## Secuencia propuesta

| Fase | Estado | Resultado buscado | Depende de |
|---|---|---|---|
| 1. Usar el prototipo en teléfono | En preparación; hardware pendiente | Un circuito completo y datos que sobreviven al cierre. | Dispositivo/entorno de cada plataforma que se vaya a probar. |
| 2. Probar con ropa propia | Propuesta | Saber si el esfuerzo de registrar prendas compensa. | Circuito móvil utilizable y limitaciones conocidas. |
| 3. Corregir la principal fricción | Condicionada a observaciones | Mejorar un problema medido del flujo. | Resultados de la fase 2 o problemas reproducibles de uso propio. |
| 4. Decidir continuidad | Abierta | Elegir herramienta personal, piloto ampliado o exploración comercial. | Comprender qué valor produce y para quién. |

### Fase 1 — Móvil y confiabilidad local

**Por qué primero:** la vista web ya permite revisar las pantallas; falta aprender y comprobar las diferencias que justifican una app móvil.

Trabajo candidato:

- Ejecutar en un iPhone y un Android si ambos entrarán en el piloto; documentar versiones y dispositivo.
- Probar cámara, galería, cancelar selección y permiso denegado; comprobar teclado, áreas seguras, lector de pantalla y controles con los cuatro temas.
- Comprobar que prendas, fotos, preferencias y uso sobreviven al cierre y reapertura. Probar el circuito sin red en una app instalada; no confundirlo con el servidor de desarrollo.
- Reproducir errores de lectura/escritura sin reemplazar datos. Resolver archivos de fotos sin referencias y estudiar respaldo antes de pedir a alguien que cargue un clóset importante.
- Revisar compatibilidad del SDK y avisos de dependencias registrados antes de distribuir una build de prueba. Preparar distribución interna solo cuando el entorno móvil lo requiera.

**Salida observable:** alta de prendas → contexto → sugerencia → cambio → uso → cierre/reapertura funciona en cada plataforma declarada. Los permisos denegados y fallos de almacenamiento tienen recuperación comprensible. Los resultados y límites quedan en `docs/evaluacion.md`.

### Fase 2 — Utilidad cotidiana

**Por qué:** confirmar que se puede construir la app no demuestra que valga la pena registrar ropa ni volver a usarla.

Empezar con uso propio; después, si se decide hacer un piloto, probar con 5–8 personas durante siete días y una selección pequeña de prendas. La convocatoria y el piloto aún no se han realizado. Observar tiempo de alta, abandono, tiempo para elegir, origen del conjunto —sugerido, ajustado o manual— y uso confirmado. Registrar motivos de rechazo sin enviar fotos a analítica.

**Salida observable:** una revisión con conteos y ejemplos que permita decidir continuar, corregir o replantear. [Producto](docs/producto.md) propone umbrales exploratorios: 5 de 8 altas útiles sin ayuda en ocho minutos, 4 de 8 personas usando sugerencias/ajustes al menos tres días y elecciones habitualmente menores de dos minutos. Son criterios provisionales; con otra muestra se reportan sus conteos y no se presentan como prueba estadística o comercial.

### Fase 3 — Una mejora según el problema observado

Elegir un problema y volver a medirlo después. Las opciones no forman una lista obligatoria de funciones.

| Observación | Posible intervención | Cómo evaluar el resultado |
|---|---|---|
| Cargar prendas consume demasiado tiempo | Menos campos iniciales, carga de varias prendas o edición posterior más rápida. | Tiempo, errores y abandono del alta antes/después. |
| Las sugerencias no encajan | Feedback con motivos, atributos corregibles y ajustes de ranking. | Conjuntos usados o ajustados, con casos donde fallaba la versión anterior. |
| Se usa principalmente el compositor | Mejor selección, prendas fijadas o lienzo libre si aporta valor. | Tiempo y pasos hasta guardar/usar una combinación propia. |
| Se registran usos por accidente | Deshacer y corregir historial, recalculando última fecha y contador. | Historial, rotación y conteos coherentes tras corregir. |
| Hay miedo a perder o mover el clóset | Exportación e importación con fotos. | Restauración en una instalación vacía conservando datos y referencias. |

**Salida observable:** se repite el caso original, se conserva la información existente y se observa una mejora o se descarta la intervención. Nuevas pruebas deben cubrir reglas o pérdida de datos, no solo la presencia de controles.

### Fase 4 — Continuidad y posible SaaS

Con evidencia de uso, decidir entre mantener una herramienta personal, ampliar la prueba o explorar una oferta de pago. Aprender y terminar aquí también es un resultado válido del proyecto.

Si se explora un SaaS, investigar qué se pagaría, frecuencia de uso y costo de servirlo. Una oferta concreta y su respuesta aportan evidencia posterior; una lista de funciones premium no valida el negocio. Antes de una distribución pública habrá que resolver licencia, identidad y soporte del producto, privacidad según el flujo real de datos, mantenimiento, costos y requisitos de las tiendas.

**Salida observable:** una decisión documentada sobre continuidad y alcance. No se han elegido modelo de negocio, precio, backend público ni proveedor de pagos.

## Capacidades opcionales

Se pueden explorar de forma aislada por un objetivo de aprendizaje explícito. Para incorporarlas al producto, conviene demostrar la necesidad y completar sus dependencias. Open-Meteo y OpenAI fueron autorizados e incorporados como servicios opcionales del prototipo; este archivo no autoriza las demás integraciones.

| Posibilidad | Qué la justificaría | Dependencias y criterio de aceptación |
|---|---|---|
| Clima por ciudad — implementado, validar uso | Introducir temperatura/lluvia es una fricción frecuente. | Proveedor, fecha de actualización, zona horaria, caché y alternativa manual. Probar red caída y datos antiguos; ubicación precisa solo si se necesita y se solicita. |
| Cuenta, respaldo y sincronización | Recuperar o usar el mismo clóset entre dispositivos supera lo que resuelve un archivo exportado. | Identidad, propiedad de datos, almacenamiento privado de fotos, migración local, conflictos, reintentos y eliminación. Recuperar y sincronizar en dos instalaciones reales. Requiere revisar ADR-002. |
| Asistencia al cargar fotos — implementada, evaluar inferencia real | La clasificación o preparación de imágenes concentra trabajo repetitivo. | Atributos propuestos con confirmación, privacidad y límites de costo. Comparar ahorro de tiempo y correcciones frente al alta manual; conservar alternativa manual. |
| Referencias de estilo | Hay interés observado en recrear una imagen con el inventario propio. | Traducir referencia a atributos corregibles y evaluar coincidencias. Identificar qué prendas son propias y qué falta; no inventar disponibilidad. Revisar ADR-003 si cambia el recomendador. |
| Planificación y viajes | Las personas intentan organizar varios días o una maleta. | Fechas, destinos, disponibilidad futura y reutilización. Comprobar que no confunde planear con registrar uso. |
| Tiendas, Shopify o afiliación | Se busca completar una compra concreta después de aprovechar el clóset. | Catálogo, vigencia de precio/stock, enlaces y atribución comercial clara. Mantener compras propuestas separadas del inventario propio. Evaluar el conflicto entre vender y recomendar usar lo que ya se tiene. |
| Suscripción u otros pagos | Existe utilidad sostenida y respuesta a una oferta. | Modelo de acceso, costos, soporte, cancelación y requisitos de distribución. Elegir proveedor y registrar la decisión cuando exista un alcance concreto. |

## Cómo mantener este roadmap

Mover una fase a completada exige enlazar evidencia de su criterio de salida. Actualizar prioridades cuando cambie el objetivo o aparezca información nueva; evitar acumular funciones solo porque sean técnicamente posibles. Las decisiones estructurales aceptadas se registran en [ADRs](docs/adr/README.md); los experimentos, observaciones y resultados pertenecen a su documentación de producto o evaluación.
