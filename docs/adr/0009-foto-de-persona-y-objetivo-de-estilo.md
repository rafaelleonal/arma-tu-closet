# ADR-009 — Foto de la persona y objetivo de estilo

- Fecha: 9/11/2026.
- Estado: la foto de la persona quedó sustituida por [ADR-010](0010-colorimetria-en-el-dispositivo.md); el objetivo de estilo y el campo opcional en v3 siguen vigentes.
- Alcance: hoja **Cambiar mi estilo** en Mi estilo y modo **Hoy me animo a algo nuevo** en Hoy.

## Contexto

La persona quiere pedir combinaciones que la acerquen a otro estilo y tomar en cuenta su tono de piel, a partir de una foto o de elecciones propias. Hasta ahora solo se analizaban fotos de prendas y ninguna regla deducía un estilo desde una imagen. Una foto de la persona es un dato más sensible: identifica a alguien y el tono de piel está cerca de inferir origen o raza.

## Decisión

- Una foto de la persona puede proponer **claridad de piel, subtono y hasta tres estilos de la ropa visible**. El esquema del contrato es estricto: cualquier otro atributo se rechaza. Las instrucciones prohíben inferir raza, etnia, origen, género, orientación, edad, religión, salud, peso, cuerpo o atractivo, y evaluar cómo se ve la persona.
- La foto solo se envía tras elegirla, aceptar un permiso específico que nombra a OpenAI y pulsar **Analizar foto**. El permiso se retira al cambiar o quitar la foto.
- La foto vive en memoria mientras la hoja está abierta. No se escribe en el documento local ni en el proxy. Se descarta al aplicar la propuesta.
- La propuesta se confirma con **Aplicar** y se puede corregir antes de **Guardar**. Sin servidor, clave o conexión, las mismas opciones siguen disponibles a mano; una opción sin elegir significa «no sé».
- `styleGoal` es un campo opcional de v3, igual que `hapticsEnabled`. No cambia la versión ni la clave, y los documentos existentes siguen siendo válidos.
- El tono solo alimenta `suggestedColors`: colores que la persona decide sumar a sus favoritos. No participa en la puntuación y nunca sugiere un color excluido.
- El modo de exploración usa el objetivo como `styleIds` y refuerza su peso y el de las prendas poco usadas. No altera disponibilidad, exclusiones ni la base válida.

## Alternativas

| Alternativa | Motivo de descarte |
|---|---|
| Solo elección manual | Era la propuesta inicial; la persona decidió incluir la foto desde la primera versión. |
| Guardar la foto en el perfil | Aumenta el riesgo y ocupa el límite web sin aportar después de confirmar los datos. |
| Muestrear el color de la piel en el dispositivo | Evita enviar la foto, pero requiere decodificar píxeles y sigue dependiendo de la luz. Queda como opción si el envío a un tercero resulta un obstáculo. |
| Puntuar conjuntos por tono de piel | Convertiría una convención sin validar en una regla que oculta prendas o las penaliza sin que se vea. |

## Consecuencias

La función funciona a mano en una build de tienda. El análisis con foto requiere el mismo backend autenticado pendiente para las prendas y, antes de publicarlo, declarar el dato en la política de privacidad y en App Store Connect. La tabla de colores es una convención de estilismo y se limita a 12 nombres sin claridad ni temperatura.

Revisar si se publica el análisis fuera de loopback, si el recorrido real muestra errores por luz o diferencias según el tono de piel, o si se añaden colores más finos. [Criterios](../recomendaciones.md#objetivo-de-estilo) · [Integración](../integraciones.md#análisis-de-la-foto-de-una-persona).
