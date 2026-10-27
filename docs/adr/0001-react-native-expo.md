# ADR-001 — React Native con Expo

- Fecha: 2026-10-23
- Estado: aceptada para el prototipo
- Alcance: aplicación móvil y entorno de desarrollo

## Contexto

El proyecto debe permitir aprender desarrollo móvil a una sola persona y probar un clóset con fotos, formularios, temas y recomendaciones. El usuario propuso React Native con Expo. La funcionalidad actual no exige una API exclusiva de una plataforma ni dos interfaces independientes.

## Decisión

Usar React Native con Expo y TypeScript estricto para compartir aplicación y dominio entre iOS y Android. Mantener web como destino de desarrollo y comprobación de recorridos. La base instalada es Expo SDK 55 y React Native 0.83; las versiones exactas se fijan en el manifiesto y lockfile.

Usar las capacidades ya incorporadas para selección de fotos y archivos. Evaluar una development build o un módulo nativo cuando una necesidad concreta lo exija; no cambiar a Swift/Kotlin por anticipación.

## Alternativas

| Alternativa | Motivo para no elegirla ahora |
|---|---|
| Aplicaciones independientes en Swift y Kotlin | Duplican interfaz y aprendizaje operativo para un prototipo individual sin requisitos específicos que lo compensen. |
| Solo aplicación web/PWA | Permite validar parte del flujo, pero reduce el trabajo directo sobre permisos, archivos y comportamiento móvil que el usuario quiere aprender. |
| React Native sin framework desde el inicio | Aumenta configuración y mantenimiento nativo antes de comprobar una limitación del flujo con Expo. |

## Consecuencias

Se comparte el código de producto y se puede iterar con rapidez en web. La elección también obliga a mantener versiones compatibles con el SDK y a probar diferencias reales entre plataformas.

La vista web no acredita cámara, permisos, teclado, accesibilidad o persistencia nativa. `expo export` genera bundles, no binarios firmados ni una publicación. La primera fase del roadmap debe producir evidencia en los dispositivos que se quieran soportar.

## Cuándo revisarla

Revisar si una función central necesita APIs no accesibles con un módulo adecuado, si aparecen problemas de rendimiento reproducibles que no se resuelven dentro de esta base, o si el costo de mantener la solución compartida supera una alternativa medida. Una preferencia estética o una dificultad puntual de configuración no bastan por sí solas.

## Referencias internas

- [Dependencias](../../package.json) y [configuración Expo](../../app.json).
- [Arquitectura](../arquitectura.md).
- [Evidencia y límites nativos](../evaluacion.md).
- [Roadmap](../../ROADMAP.md).
