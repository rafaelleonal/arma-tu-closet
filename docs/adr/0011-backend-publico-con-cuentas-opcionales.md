# ADR-011 — Backend público con cuentas opcionales

- Fecha: 11/11/2026.
- Estado: aceptada. Fases 1 a 3 implementadas del lado del servidor y probadas en local; nada desplegado. No sustituye a [ADR-002](0002-persistencia-local.md): el clóset sigue en el teléfono.
- Alcance: cuentas, alojamiento y límites de la API. El detalle está en el [plan del backend público](../backend-publico.md), cuyas decisiones aceptó el titular el 9/11/2026.

## Contexto

El proxy de `server/` solo escucha en loopback y la build de tienda no tiene URL de análisis. Publicar la IA, respaldar el clóset o abrir un marketplace exige un servicio público, y los tres necesitan saber quién llama. Una identidad anónima por dispositivo habría que migrarla después.

## Decisión

- **Cuentas opcionales.** El clóset, los conjuntos, el clima y el historial funcionan sin registro. La cuenta se pide solo para lo que vive en la nube: IA, respaldo y marketplace.
- **Identidad en Supabase Auth**, con Apple y Google. La API verifica el JWT contra el JWKS y autoriza con su propia base: ningún claim concede permisos. `users.id` es el UUID de Auth.
- **API propia en NestJS, Prisma y Postgres**, en un repositorio aparte (`arma-tu-outfit-api`) con el contrato publicado por OpenAPI. La app nunca se conecta a Postgres.
- **Cloud Run** para el contenedor, separado del VPS de Tabe. Postgres y Storage en Supabase. Las migraciones son un paso previo del despliegue y las tareas periódicas llegan por Cloud Scheduler.
- **Eliminar la cuenta dentro de la app**, con sesión reciente. La cuenta queda bloqueada al instante, se borra la identidad y los datos personales tienen borrado real. El rol con que corre la API no puede borrar.
- **Límites.** Topes de IA en la beta: 20 USD al mes y 2 USD al día, con reserva antes de cada llamada. Cuotas por persona según el [plan](../backend-publico.md#6-límites-y-costo). Cada función tiene un interruptor que la app consulta en `/api/status`.
- **Registros con lista cerrada.** Nunca cuerpo, imagen, IP, token ni identificador de la persona.

Las reglas 1 a 7 de [AGENTS.md](../../AGENTS.md) no cambian: el recomendador sigue en el teléfono, la IA solo propone y ninguna foto de una persona sale del dispositivo ([ADR-010](0010-colorimetria-en-el-dispositivo.md)).

## Alternativas

| Alternativa | Motivo de descarte |
|---|---|
| Identidad anónima con App Attest y Play Integrity | Añade un módulo nativo y verificación en servidor, y obliga a migrar al llegar el respaldo. Queda como refuerzo si aparece abuso. |
| Acceso directo a Postgres con RLS desde la app | Deja las cuotas, el gasto y el marketplace sin un lugar donde aplicar reglas. RLS se conserva como defensa, sin políticas para la app. |
| Edge Function para el análisis | Era la propuesta del [plan de despliegue](../deploy-plan.md). No da base para cuentas ni marketplace y obliga a adaptar el servidor a Deno. |
| El VPS de Tabe | Ya se quedó sin memoria con sus tres entornos. Otro servicio arriesga a ambos productos. |
| Exigir cuenta para usar la app | Contradice el objetivo del producto y la regla 5.1.1(v) de Apple. |

## Consecuencias

Hay un segundo repositorio que mantener y dos proveedores que operar. La app pasa a declarar correo e identificador de cuenta en las fichas de las tiendas, y necesita una build nueva con la pantalla de acceso y **Eliminar cuenta**. El texto «Tus datos se quedan en tu teléfono» deja de ser exacto al activar la IA.

El costo fijo estimado es de unos 25 USD al mes en producción, más la IA por uso. Al ir todo en Docker, cambiar de alojamiento solo cambia el destino del despliegue.

Implementado el 11/11/2026 en `arma-tu-outfit-api`: base del servicio, sesiones, tabla `users`, eliminación de cuenta, `/api/status`, CI y Docker; y los dos endpoints de IA con permiso explícito, cuotas por persona, tope de gasto e idempotencia, sobre un proveedor simulado; y un adaptador de OpenRouter para ambas funciones, probado con un transporte simulado. (El primer commit usaba adaptadores directos de OpenAI y Anthropic; el titular eligió OpenRouter el 11/11/2026 para escoger modelos por configuración.) Verificado con pruebas unitarias, contra Postgres real —incluidas las de concurrencia— y e2e, en local. **Sin verificar:** un token real de Supabase, cualquier llamada a OpenRouter, el despliegue, el flujo nativo de Apple y Google, y la revocación de Sign in with Apple. La app aún no tiene acceso ni llama a esta API.

Diferencias con el plan:

- El borrado real lo hacen funciones de la base con privilegios propios, en lugar de una tarea con un rol y una conexión aparte. El rol de ejecución sigue sin `DELETE`.
- `ai_spend` guarda una fila por día y otra por mes, no solo por día, para que el tope mensual también se compruebe en una sola sentencia.
- La reserva de una llamada ocurre en una transacción de varias sentencias, cada una atómica sobre su contador, en lugar de una sola sentencia para todos.
- El resultado de analizar una foto no se guarda ni para responder un reintento: la misma clave devuelve un conflicto y no vuelve a cobrar. La elección de outfit sí devuelve el índice anterior.
- Una llamada que el proveedor no llegó a responder por tiempo agotado se contabiliza al costo estimado, por si fue facturada.
- La IA pasa por OpenRouter y no por las API directas de OpenAI y Anthropic (decisión 6 del plan, cambiada). El permiso nombra a OpenRouter y al autor del modelo, y el gasto real es el que OpenRouter informa en cada respuesta.

Revisar si App Review no acepta pedir cuenta solo para funciones de nube, si el titular o los países cambian las obligaciones de privacidad ([decisión 8](../backend-publico.md#10-decisiones), pendiente), o antes de empezar el marketplace.
