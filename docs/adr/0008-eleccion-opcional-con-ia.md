# ADR-008 — Elección opcional de un conjunto con IA

- Estado: aceptada para evaluación en desarrollo.
- Alcance: elección de la propuesta principal en Hoy.

Las reglas locales siguen siendo la fuente de conjuntos válidos. Una acción explícita permite al proxy local elegir entre los conjuntos visibles que encajan con el día. La solicitud contiene categorías, colores, estilos y atributos de contexto. La respuesta contiene únicamente un índice que cliente y servidor comprueban contra las opciones enviadas. Las prendas, motivos y advertencias se toman de las propuestas locales.

Este experimento permite comparar la coordinación de prendas sin ampliar las decisiones del modelo a inventario, edición de prendas ni registro de uso. El fallo de la red o del proveedor deja disponibles las propuestas locales. El proxy permanece en loopback y comparte límites de solicitudes con el análisis de prendas.

Revisar la decisión cuando exista evidencia de que las personas eligen o usan más los conjuntos priorizados por IA, con una espera aceptable. Véanse los [criterios de recomendación](../recomendaciones.md#elección-opcional-con-ia).
