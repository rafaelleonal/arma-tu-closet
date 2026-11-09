# Clima y registro asistido

Actualizado: 27/10/2026. Alcance: prototipo local. Decisiones: [servicios opcionales](adr/0004-servicios-externos-opcionales.md) y [ubicación para elegir ciudad](adr/0005-ubicacion-para-elegir-ciudad.md).

## Open-Meteo

1. Abre Hoy → Cambiar → Automático, o elige «Nunca le atino al clima» en el primer paso del onboarding.
2. En iOS/Android pulsa **Usar mi ubicación**; si no das permiso o no se encuentra la ciudad, usa **Buscar por nombre** y selecciona un resultado. Una búsqueda escrita no cambia por sí sola la ciudad.
3. En Hoy, revisa el clima manual de respaldo y pulsa Aplicar. En el onboarding la ciudad se aplica al elegirla.

La búsqueda envía el nombre consultado al geocodificador; el pronóstico envía las coordenadas de esa ciudad. Con **Usar mi ubicación**, el permiso se pide solo al pulsar; la posición aproximada se traduce a un nombre con el servicio del sistema operativo, se busca en Open-Meteo y se elige el resultado más cercano a menos de 50 km. La posición del dispositivo no se guarda ni se envía a Open-Meteo, y la ciudad no se actualiza sola al moverte. Web no ofrece esta opción. Consulta datos actuales, no un pronóstico por horario de salida. La temperatura del aire aparece en la tarjeta; la sensación térmica ordena las recomendaciones. Precipitación incluye lluvia y nieve.

La app guarda una caché por ciudad, refresca después de 30 minutos y comprueba cada minuto mientras está activa, además de al recuperar actividad. Tras un fallo automático espera al menos cinco minutos para reintentar; el botón Actualizar permite reintentar antes. El límite de cada consulta es diez segundos. A las tres horas —edad de descarga o dato meteorológico— la caché deja de usarse. La pantalla identifica el respaldo manual. Cambiar a Manual conserva los valores que introdujiste y la última ciudad automática.

Open-Meteo gratuito se usa para este prototipo no comercial. Revisar [planes y condiciones de uso](https://open-meteo.com/en/pricing) antes de monetizar; la UI incluye atribución.

## Análisis de una foto

El análisis propone **nombre, categoría y colores**. No determina cuánto abriga, si resiste lluvia, material, marca, género, ocasiones ni disponibilidad. Usa una sola prenda o un par de calzado. Varias prendas, una foto ambigua o un objeto que no es ropa producen un mensaje para volver a intentar o continuar a mano.

Seleccionar una imagen solo la conserva localmente. Pulsar Analizar foto la envía al proxy local y a OpenAI, después del aviso visible. El resultado aparece en Revisar análisis; se puede corregir o descartar. Aplicar estos datos reemplaza esos tres campos del formulario, sin guardar la prenda. Agregar prenda/Guardar cambios confirma el guardado local. Cerrar, cancelar o cambiar foto invalida una respuesta pendiente.

### Preparar el servidor

```bash
cp .env.server.example .env.server
# Configura OPENAI_API_KEY dentro de .env.server con tu editor.
pnpm server
```

- `OPENAI_API_KEY`: solo servidor, nunca `EXPO_PUBLIC_` ni almacenada en el clóset.
- `OPENAI_MODEL`: opcional; valor inicial `gpt-6-luna`.
- `AI_SERVER_PORT`: opcional; 8787 por defecto. Cambiarlo exige actualizar la URL del cliente.
- `EXPO_PUBLIC_AI_API_URL`: URL base del proxy en `.env`. Web local usa `http://127.0.0.1:8787` si falta. En nativo se requiere explícitamente. Reinicia Metro al cambiar variables.

`pnpm server` carga `.env.server` con Node 24. Sin clave arranca y responde un error claro al analizar. `GET /health` indica si están configurados el análisis de fotos (`configured`) y la elección de conjuntos (`outfitChoiceConfigured`), sin verificar credenciales. No se crea ningún modo simulado en el servidor normal.

### Transporte y límites

El servidor escucha solo en `127.0.0.1`. Admite Host local y los orígenes web `http://localhost:8081`, `http://127.0.0.1:8081` y los equivalentes en 8082. Estas comprobaciones no son autenticación de un SaaS. No lo publiques ni lo abras en la LAN como backend de producción.

Un teléfono físico usa su propio loopback: para pruebas necesita un reenvío local de puerto hacia la computadora. Por ejemplo, un dispositivo Android de desarrollo conectado por ADB puede usar `adb reverse tcp:8787 tcp:8787` y la URL explícita `http://127.0.0.1:8787`. La conexión nativa, restricciones HTTP y permisos aún deben verificarse en cada dispositivo. No se promete que Expo Go en cualquier teléfono pueda alcanzar este servidor directamente.

- JPEG, PNG o WebP, hasta 4 MiB; contenido y MIME deben coincidir. No se aceptan URLs remotas.
- El límite agregado de fotos web de 2 millones de caracteres sigue vigente y puede impedir guardar una foto más pequeña que el límite del análisis.
- Dos análisis simultáneos, seis por minuto y cincuenta por proceso del servidor; reiniciarlo reinicia esos contadores. Son topes de desarrollo, no cuotas por usuario.
- Diez segundos para recibir el cuerpo, veinte para el proveedor y treinta en el cliente. Sin reintentos automáticos al proveedor para evitar costo duplicado.
- Clave e imágenes no se escriben en logs. El proxy no persiste imágenes ni resultados. `store: false` desactiva almacenamiento de respuestas de OpenAI; no declara retención cero de todos los sistemas del proveedor.

## Análisis de la foto de una persona

En **Mi estilo → Cambiar mi estilo**, una foto opcional puede proponer claridad de piel, subtono y hasta tres estilos de la ropa visible. `POST /api/person-style` comparte el proxy, los orígenes, los límites de imagen y los contadores del análisis de prendas, y usa `OPENAI_API_KEY`. No hay un interruptor aparte.

La foto se envía solo tras aceptar el permiso que nombra a OpenAI y pulsar Analizar foto. Cambiarla o quitarla retira el permiso. No se escribe en el documento local ni en el proxy, y `store: false` tiene el mismo alcance descrito arriba. Una foto sin persona, con varias personas, poco clara o de alguien que parece menor de edad devuelve un mensaje para reintentar o elegir a mano. [ADR-009](adr/0009-foto-de-persona-y-objetivo-de-estilo.md).

## Estado de verificación

Consulta [evaluación](evaluacion.md) para pruebas exactas. A petición del usuario no se hizo una llamada real a OpenAI: los tests y el recorrido de confirmación usan una respuesta controlada. Quedan pendientes precisión con prendas reales, disponibilidad del modelo en la cuenta, latencia y costo efectivos. Open-Meteo sí tuvo consulta real.

Antes de un despliegue público se necesitan autenticación, límites por usuario, HTTPS, tratamiento de fotos documentado, monitoreo sin contenido sensible y presupuesto. El clóset manual y el recomendador local no dependen de esa futura operación.

## Elección de conjunto en Hoy

Agrega `OPENROUTER_API_KEY` a tu `.env.server` local. Si el archivo aún no existe, copia `.env.server.example`. `OPENROUTER_OUTFIT_MODEL` es opcional y usa [`anthropic/claude-sonnet-5.5`](https://openrouter.ai/anthropic/claude-sonnet-5.5) por defecto. Si solo configuras OpenAI, el proxy usa esa configuración previa para ambos flujos. Si configuras ambas claves, usa OpenRouter para conjuntos y OpenAI para fotos. Un fallo de OpenRouter vuelve al orden local.

1. Ejecuta `pnpm server`. El arranque debe indicar «Conjuntos: OpenRouter».
2. En el simulador iOS, configura `EXPO_PUBLIC_AI_API_URL=http://127.0.0.1:8787` en `.env` y reinicia Metro. Abre el build de desarrollo de iOS.
3. En **Hoy**, anota la primera propuesta y pulsa **Elegir con IA**. El botón aparece en desarrollo con al menos dos propuestas que cumplen los filtros del contexto. La IA puede elegir la primera opción.

`POST /api/outfit-choice` comparte el proxy, los orígenes permitidos y los límites del análisis de fotos. Acepta de dos a cinco conjuntos, con un tope de 16 KiB. OpenRouter recibe los atributos y el contexto necesarios para devolver un índice. El proxy exige [salida estructurada](https://openrouter.ai/docs/guides/features/structured-outputs), solicita [excluir proveedores que recopilan datos](https://openrouter.ai/docs/guides/routing/provider-selection) y comprueba el índice contra las opciones. La llamada usa esfuerzo bajo y un máximo de 512 tokens de salida. El adaptador se verificó con respuestas simuladas. La primera consulta real queda pendiente.
