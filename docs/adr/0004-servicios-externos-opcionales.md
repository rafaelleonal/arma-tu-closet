# ADR-004 — Clima y análisis de prendas como servicios opcionales

- Fecha: 2026-10-23
- Estado: aceptada para el prototipo local. La frase «No pedir GPS» fue sustituida el 27/10/2026 por [ADR-005](0005-ubicacion-para-elegir-ciudad.md)
- Alcance: Open-Meteo, análisis con OpenAI, confirmación y esquema v3

## Contexto

La persona pidió automatizar el clima y reducir la captura de prendas con IA. El clóset y las recomendaciones deben seguir funcionando cuando falle la red o no haya una clave. Las fotos pueden contener información personal; el reconocimiento puede equivocarse.

## Decisión

Consultar Open-Meteo directamente desde la app después de seleccionar una ciudad. No pedir GPS. Obtener temperatura, sensación térmica, precipitación y código del clima actuales; usar sensación para el abrigo y mostrar la temperatura real por separado. Son estimaciones actuales del modelo meteorológico, no una garantía para todas las horas del día.

Guardar ciudad y caché en `weather`, dentro del documento v3, migrando v1/v2 en la misma clave. Conservar los controles manuales separados. Refrescar cada 30 minutos al estar activa la app, invalidar resultados de otra ciudad y dejar de usar datos de tres horas o más; señalar el respaldo manual. Atribuir a Open-Meteo.

Analizar una sola prenda por foto, solo tras pulsar Analizar foto. Un servidor Node local mantiene la clave de OpenAI y usa AI SDK con salida estructurada. GPT-6 Luna es el modelo inicial configurable. Validar entrada y salida en ambos extremos. La propuesta incluye únicamente nombre, categoría y colores; la persona puede corregirla, aplicarla al formulario y guardar después. No deducir género, disponibilidad, impermeabilidad, composición exacta o abrigo desde la imagen.

El servidor no guarda fotos ni atributos. Desactivar almacenamiento de la respuesta en el proveedor (`store: false`) no equivale a afirmar retención cero del proveedor. No registrar imágenes ni claves. Limitar tamaño, formatos, duración, concurrencia y frecuencia; mantener el servidor en loopback con orígenes y Host permitidos. Esta frontera local no sustituye autenticación de producción.

## Alternativas

| Alternativa | Motivo para descartarla ahora |
|---|---|
| Clave de OpenAI en Expo | El bundle expone su contenido. Una variable pública no es un secreto. |
| LLM que genera y guarda la prenda | Una clasificación plausible puede ser incorrecta. La revisión humana es parte del flujo solicitado. |
| Usar IA para todo el recomendador | El pedido actual automatiza captura y contexto. Las reglas conservan restricciones comprobables y no requieren red. |
| Importar el clóset entero desde una foto | La segmentación y ambigüedad aumentan errores. Se inicia con una prenda o un par de zapatos. |
| Gateway de varios modelos o backend SaaS completo | Un proveedor y un proxy local bastan para este experimento; no hay todavía cuentas ni necesidad de operación pública. |

## Consecuencias y revisión

Aparecen dependencia de red, costos por análisis y tratamiento externo explícito de imágenes. Open-Meteo gratuito es para evaluación no comercial: revisar plan y atribución antes de comercializar. La salida estructurada asegura forma, no exactitud visual.

Antes de exponer el análisis a terceros: autenticación, cuotas por usuario, despliegue HTTPS, política de datos y medición de costo/calidad con ropa representativa. Antes de afirmar soporte móvil: probar transporte, cámara y permisos en dispositivo. Revisar esta decisión si la captura no ahorra tiempo o si se necesita sincronización.

## Referencias

- [Open-Meteo: datos actuales](https://open-meteo.com/en/docs), [geocoding](https://open-meteo.com/en/docs/geocoding-api), [planes](https://open-meteo.com/en/pricing).
- [OpenAI: imágenes](https://developers.openai.com/api/docs/guides/images-vision), [salida estructurada](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).
- [Configuración y límites](../integraciones.md), [evaluación](../evaluacion.md).
