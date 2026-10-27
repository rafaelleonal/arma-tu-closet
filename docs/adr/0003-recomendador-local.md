# ADR-003 — Recomendador local determinista

- Fecha: 2026-10-23
- Estado: aceptada para el prototipo
- Alcance: generación, intercambio y registro de uso de conjuntos

## Contexto

El producto necesita proponer combinaciones con ropa existente y explicar límites como falta de calzado, colores excluidos o abrigo insuficiente. Aún no hay feedback ni datos de uso que demuestren la necesidad de un modelo de IA. El primer objetivo es probar un circuito comprensible y corregible.

## Decisión

Mantener el recomendador como funciones puras en TypeScript, separado de React, almacenamiento y red. Recibe guardarropa y contexto explícito, incluida la fecha, y devuelve conjuntos con motivos y advertencias. La misma entrada produce el mismo resultado.

Aplicar disponibilidad y colores excluidos antes de puntuar. Usar ocasión, temperatura, lluvia declarada, colores preferidos, etiquetas explícitas de estilo y uso reciente como señales flexibles. Una base completa requiere arriba + abajo + calzado, o prenda completa + calzado. No inventar piezas para resolver insuficiencia.

Acotar los grupos de candidatos y diversificar alternativas para mantener el cálculo manejable. La poda puede omitir una mejor combinación global; el resultado no es una búsqueda exhaustiva ni una evaluación profesional de estilo.

Conservar contratos separados para guardar y usar: guardar almacena una instantánea; usar revalida las prendas actuales y actualiza fecha/contador. El tema visual no entra al recomendador. Los estilos se declaran por etiquetas, sin deducir identidad o preferencias de una fotografía. El armado manual mantiene la elección de prendas disponibles aunque la persona haya excluido un color de las sugerencias.

## Alternativas

| Alternativa | Motivo para no elegirla ahora |
|---|---|
| LLM o modelo de visión para cada conjunto | Añade red, latencia, costo y validación de respuestas antes de saber si las reglas resuelven el caso; sus propuestas también tendrían que limitarse al inventario real. |
| Solo composición manual | Es un flujo útil y ya está disponible, pero no permite evaluar la hipótesis de ayuda mediante sugerencias. |
| Reglas dentro de componentes de pantalla | Acopla presentación y puntuación, dificulta pruebas reproducibles y vuelve más costoso comparar alternativas. |
| Enumerar todas las combinaciones | Crece rápidamente con el clóset; no aporta una mejora demostrada que justifique el costo actual. |

## Consecuencias

Se pueden probar restricciones, rotación, determinismo y casos de escasez sin un dispositivo ni proveedor externo. Las personas reciben razones vinculadas a datos declarados.

Las sugerencias dependen de la calidad de esos datos y de pesos definidos por el proyecto. No aprenden de gustos, no conocen tendencias y no consultan un pronóstico. La rotación puede repetir prendas si faltan alternativas. Ocultar explicaciones no debe eliminar advertencias necesarias.

## Cuándo revisarla

Revisar si los motivos de rechazo muestran limitaciones persistentes que no se resuelven con atributos o reglas, o si una necesidad observada de referencias visuales requiere otro método. Comparar la alternativa con esta base usando prendas propias, calidad de resultados, errores, tiempo y costo. Mantener la validación de pertenencia, disponibilidad y exclusiones aunque cambie el generador.

Si se añade pronóstico, obtener y validar ese contexto fuera del dominio. Cambiar la fuente del clima no obliga por sí solo a abandonar funciones puras.

## Referencias internas

- [Motor](../../src/domain/recommendations.ts) y [tipos](../../src/domain/types.ts).
- [Contrato y límites de búsqueda](../recomendaciones.md).
- [Pruebas de dominio](../../tests/domain.test.ts).
- [Hipótesis y piloto](../producto.md).
