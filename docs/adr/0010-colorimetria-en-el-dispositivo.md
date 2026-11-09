# ADR-010 — Prueba de colorimetría en el dispositivo

- Fecha: 9/11/2026.
- Estado: aceptada para el prototipo local. Sustituye a [ADR-009](0009-foto-de-persona-y-objetivo-de-estilo.md) en lo relativo a la foto de la persona.
- Alcance: **Colorimetría** dentro de Cambiar mi estilo.

## Contexto

ADR-009 enviaba una foto de la persona a OpenAI para proponer claridad de piel y subtono. La [política de uso de OpenAI](https://openai.com/es-419/policies/usage-policies/), en vigor desde el 20/11/2026, prohíbe la clasificación de personas por características personales, y el titular decidió no consultarlo. Lo que se busca es una experiencia como la colorimetría personal de Corea o Japón, donde se comparan telas de colores junto a la cara.

## Decisión

- La prueba simula ese drapeado: la selfie aparece rodeada de dos colores y la persona elige con cuál se ve su piel más uniforme. Nueve comparaciones en tres rondas: temperatura, estación y subtipo. El resultado es uno de ocho tonos.
- **Decide la persona.** No hay IA ni medición de la piel, y la app no clasifica a nadie.
- La selfie vive en memoria mientras la prueba está abierta. No se guarda, no se envía y no entra al documento local.
- Solo se conserva `styleGoal.colorTone`, un campo opcional de v3. La pregunta evita pedir una piel «más clara», para no premiar aclararla.
- El tono solo sugiere colores que la persona decide sumar a sus favoritos. No puntúa conjuntos ni excluye prendas, y nunca sugiere un color excluido.
- Se retiran `/api/person-style`, su contrato y la elección manual de claridad y subtono.

## Alternativas

| Alternativa | Motivo de descarte |
|---|---|
| Consultar a OpenAI y publicar el análisis | El titular lo descartó. Además obligaba a declarar la foto y a pedir permiso de envío. |
| Medir el color de la piel en el dispositivo | Requiere decodificar píxeles, depende de la luz y volvería a clasificar a la persona. |
| Conservar la selfie para repetir la prueba | Aumenta el riesgo sin aportar: repetirla toma un minuto. |

## Consecuencias

La función no necesita backend, cuenta ni declaración de fotos, y puede salir en la primera versión de la tienda. Es una simulación: los colores en pantalla no iluminan la cara como una tela real, y el resultado depende de la luz, la foto y la pantalla. La tabla de tonos es una convención de estilismo sin validación científica, y los 12 nombres de color del clóset la representan solo de forma aproximada.

Revisar si la prueba con personas muestra resultados incoherentes entre repeticiones, o si se añaden colores más finos. [Criterios](../recomendaciones.md#objetivo-de-estilo).
