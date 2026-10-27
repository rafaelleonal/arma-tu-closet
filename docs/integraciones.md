# Clima y registro asistido

Actualizado: 27/10/2026. Alcance: prototipo local. Decisiones: [servicios opcionales](adr/0004-servicios-externos-opcionales.md) y [ubicación para elegir ciudad](adr/0005-ubicacion-para-elegir-ciudad.md).

## Open-Meteo

1. Abre Hoy → Cambiar → Automático, o el bloque Clima del paso Tu rutina en el onboarding.
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

`pnpm server` carga `.env.server` con Node 24. Sin clave arranca y responde un error claro al analizar; no inventa un resultado. `GET /health` devuelve si está configurado, sin revelar credenciales. No se crea ningún modo simulado en el servidor normal.

### Transporte y límites

El servidor escucha solo en `127.0.0.1`. Admite Host local y los orígenes web `http://localhost:8081`, `http://127.0.0.1:8081` y los equivalentes en 8082. Estas comprobaciones no son autenticación de un SaaS. No lo publiques ni lo abras en la LAN como backend de producción.

Un teléfono físico usa su propio loopback: para pruebas necesita un reenvío local de puerto hacia la computadora. Por ejemplo, un dispositivo Android de desarrollo conectado por ADB puede usar `adb reverse tcp:8787 tcp:8787` y la URL explícita `http://127.0.0.1:8787`. La conexión nativa, restricciones HTTP y permisos aún deben verificarse en cada dispositivo. No se promete que Expo Go en cualquier teléfono pueda alcanzar este servidor directamente.

- JPEG, PNG o WebP, hasta 4 MiB; contenido y MIME deben coincidir. No se aceptan URLs remotas.
- El límite agregado de fotos web de 2 millones de caracteres sigue vigente y puede impedir guardar una foto más pequeña que el límite del análisis.
- Dos análisis simultáneos, seis por minuto y cincuenta por proceso del servidor; reiniciarlo reinicia esos contadores. Son topes de desarrollo, no cuotas por usuario.
- Diez segundos para recibir el cuerpo, veinte para el proveedor y treinta en el cliente. Sin reintentos automáticos al proveedor para evitar costo duplicado.
- Clave e imágenes no se escriben en logs. El proxy no persiste imágenes ni resultados. `store: false` desactiva almacenamiento de respuestas de OpenAI; no declara retención cero de todos los sistemas del proveedor.

## Estado de verificación

Consulta [evaluación](evaluacion.md) para pruebas exactas. A petición del usuario no se hizo una llamada real a OpenAI: los tests y el recorrido de confirmación usan una respuesta controlada. Quedan pendientes precisión con prendas reales, disponibilidad del modelo en la cuenta, latencia y costo efectivos. Open-Meteo sí tuvo consulta real.

Antes de un despliegue público se necesitan autenticación, límites por usuario, HTTPS, tratamiento de fotos documentado, monitoreo sin contenido sensible y presupuesto. El clóset manual y el recomendador local no dependen de esa futura operación.
