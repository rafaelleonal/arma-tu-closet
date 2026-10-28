# ADR-006 — Recorte de fondo en el dispositivo y build de desarrollo

- Fecha: 2026-10-27
- Estado: aceptada para el prototipo local (iOS); Android pendiente
- Alcance: módulo local `modules/subject-cutout`, campo `cutoutUri`, build de desarrollo

## Contexto

La persona quiere que las fotos de su ropa se vean sin fondo, como las del clóset de ejemplo. Recortar las 10 fotos de ejemplo en macOS con el recorte de sujeto de Apple Vision dio resultados limpios con fondos claros, oscuros y de madera. Expo Go no incluye esa capacidad, y ninguna dependencia de Expo instalada la ofrece.

## Decisión

Crear un módulo local de Expo (`modules/subject-cutout`) que en iOS 17+ use `VNGenerateForegroundInstanceMaskRequest` para quitar el fondo en el teléfono. Solo se ejecuta al pulsar **Quitar fondo** en el editor de prendas. Devuelve un PNG transparente de hasta 1200 px en el lado mayor, guardado en `documents/wardrobe/`.

La prenda guarda el recorte en el campo opcional `cutoutUri` y conserva siempre `photoUri`. Un recorte sin foto original no es válido. **Usar original** quita el recorte de la prenda. Las vistas prefieren el recorte y, si no hay, muestran la foto o el dibujo. El documento sigue en la versión 3 con la misma clave: el campo es opcional, igual que `hapticsEnabled`, y los documentos anteriores siguen siendo válidos sin migración.

El módulo no está disponible en Expo Go, web ni Android; ahí no aparece el botón. Para usarlo hace falta una build de desarrollo (`expo-dev-client`, `npx expo run:ios`). Las carpetas `ios/` y `android/` se generan y no se versionan.

## Alternativas

| Alternativa | Motivo para descartarla ahora |
|---|---|
| Servicio de recorte en el servidor local o de terceros | La foto saldría del teléfono, requeriría permiso explícito por envío, red y, en servicios de pago, costo. |
| Modelo abierto de segmentación incluido en la app | Aumenta mucho el tamaño y el trabajo de integración; Apple ya incluye uno de buena calidad. |
| Reemplazar la foto original por el recorte | Un recorte equivocado sería irreversible. |
| Librería comunitaria de recorte | Habría que verificar su compatibilidad con SDK 58 y su mantenimiento; el módulo propio son unas 60 líneas de Swift. |

## Consecuencias y revisión

Se deja Expo Go para probar esta función: el desarrollo nativo pasa por `npx expo run:ios`, CocoaPods y Xcode. El simulador no sirve para validar la calidad del recorte: Vision responde «Could not create inference context» (código 9) en iOS 17.0 y 26.5, también con la CPU como dispositivo de cómputo. Esa prueba requiere un iPhone. Cada recorte agrega un archivo PNG; como las fotos, los recortes que quedan sin referencia aún no se limpian. Android necesita una implementación propia (por ejemplo, la segmentación de sujetos de ML Kit) y su propia prueba de calidad.

Revisar si los recortes fallan a menudo con fotos reales o si se necesita sincronizar el clóset: en ese caso, subir el recorte junto con la original al almacenamiento privado propuesto en [cuentas y datos](../cuentas-y-datos.md).

## Referencias

- [Código del módulo](../../modules/subject-cutout/ios/SubjectCutoutModule.swift), [editor de prendas](../../src/components/ItemEditor.tsx), [esquema](../../src/storage/schema.ts).
- [Expo Modules API](https://docs.expo.dev/modules/overview/), [Apple Vision: VNGenerateForegroundInstanceMaskRequest](https://developer.apple.com/documentation/vision/vngenerateforegroundinstancemaskrequest).
