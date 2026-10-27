# ADR-002 — Persistencia local versionada

- Fecha: 2026-10-23
- Estado: aceptada para el prototipo
- Alcance: datos del clóset, preferencias, conjuntos, uso y fotos

## Contexto

El primer circuito debe funcionar sin cuenta ni operación de un servidor. Las personas pueden invertir tiempo en registrar prendas; perder ese trabajo para introducir una preferencia o cambiar el esquema sería un defecto central del producto.

## Decisión

Guardar un documento JSON validado con AsyncStorage. El esquema inicial de esta decisión era v2; la ampliación v3 de [ADR-004](0004-servicios-externos-opcionales.md) agrega el clima y conserva la clave `@arma-tu-outfit/v1` para leer instalaciones previas. La migración agrega perfil y apariencia preservando los datos de v1. Un documento inválido o de versión desconocida produce un error; no se sustituye por una demo.

La aplicación hidrata antes de escribir, serializa escrituras y confirma los cambios después de resolver el guardado. La demo se incorpora solo cuando la persona la elige; un clóset vacío es un estado válido.

En móvil, copiar fotos al directorio de documentos de la app y guardar su URI. En web, guardar una data URI y limitar el documento completo a 2 millones de caracteres. Este límite es una protección interna, no una promesa de cuota disponible. La ampliación de [ADR-004](0004-servicios-externos-opcionales.md) permite analizar una foto por acción explícita, sin cambiar su persistencia local.

## Alternativas

| Alternativa | Motivo para no elegirla ahora |
|---|---|
| Cuenta y base remota desde el inicio | Añade autenticación, sincronización, almacenamiento de fotos y operación antes de validar el circuito o necesitar varios dispositivos. |
| SQLite y repositorios por entidad | Puede facilitar consultas y escrituras parciales a mayor escala; el prototipo pequeño no exige todavía esa complejidad. |
| Estado solo en memoria | Impide probar uso repetido y pierde el trabajo al reiniciar. |
| Nueva clave o restablecimiento en cada versión | Oculta datos existentes y rompe continuidad; no es una estrategia de migración. |

## Consecuencias

El núcleo no depende de servicios externos y se puede probar con datos controlados. La versión del esquema, sus validadores y migraciones forman un contrato que debe cubrirse con pruebas.

Se acepta escribir el documento completo, duplicar datos de prendas en instantáneas guardadas y tener límites de capacidad. No existe sincronización ni copia de seguridad. Desinstalar o borrar el almacenamiento puede perder datos. Los archivos de fotos que quedan sin referencias aún necesitan una política de limpieza.

AsyncStorage no se trata como almacén de secretos. Si se introducen credenciales, deben diseñarse su almacenamiento y ciclo de vida expresamente.

## Cuándo revisarla

Revisar cuando mediciones muestren escrituras lentas o exceso de tamaño, cuando sea necesaria recuperación/traslado, o cuando exista una necesidad de sincronizar varios dispositivos. Primero evaluar qué resuelve una exportación/importación local; elegir una base remota solo con sus requisitos de identidad, conflictos, fotos, eliminación y recuperación definidos.

Cualquier sustitución debe incluir migración y verificación de conservación del clóset, no una reinstalación como procedimiento de actualización.

## Referencias internas

- [Esquema y migración](../../src/storage/schema.ts).
- [Lectura, cola de escrituras y fotos](../../src/storage/local.ts).
- [Pruebas de esquema](../../tests/storage.test.ts).
- [Limitaciones verificadas](../evaluacion.md).
