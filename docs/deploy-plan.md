# Plan de despliegue y distribución

23/10/2026 · Plan, no despliegue realizado. No hay proyecto EAS vinculado, backend público, cuentas de tiendas ni binarios firmados creados por esta entrega.

## Dónde alojar cada parte

| Parte | Propuesta | Por qué y trabajo pendiente |
|---|---|---|
| Aplicación iOS/Android | Binarios con EAS Build; TestFlight y Google Play para distribución | La app se instala en el teléfono. Metro es desarrollo, no hosting de producción. |
| Cuenta, clóset y fotos | Supabase Auth + Postgres + Storage privado | Un proveedor para los datos relacionados, con políticas por usuario. Implementación en [cuentas y datos](cuentas-y-datos.md). |
| Análisis de prendas | Supabase Edge Function autenticada | Mantener claves fuera del móvil y limitar gasto por usuario. Adaptar el handler Node actual a Request/Response; probar librerías npm, payload, timeout y comportamiento en el runtime Deno. No subir `server/index.ts` sin adaptación. |
| Correo de acceso | SMTP de producción, propuesta inicial Resend | Configurar dominio, SPF/DKIM, remitente, entrega y límites. Es una dependencia adicional; todavía no se ha contratado. |
| Privacidad, soporte y eliminación de cuenta | Sitio público estático en EAS Hosting con dominio propio | Mantiene la operación del sitio junto a Expo. Crear estas páginas antes de las fichas de tiendas; no publicar automáticamente la vista web del clóset. |
| Clima | Open-Meteo, llamada por ciudad desde la app | Conservar respaldo manual y caché. Revisar condiciones comerciales antes de monetizar y mover credenciales comerciales al servidor si son necesarias. |

EAS construye binarios y permite distribuirlos; las Edge Functions tienen un runtime y límites propios. Esta combinación es una recomendación para reducir operación, no una prueba de compatibilidad del servidor existente. Si la adaptación de IA no resulta viable, evaluar un servicio Node gestionado y conservar el contrato del cliente. [EAS Build](https://docs.expo.dev/build/introduction/), [Edge Functions](https://supabase.com/docs/guides/functions), [límites](https://supabase.com/docs/guides/functions/limits), [EAS Hosting](https://docs.expo.dev/eas/hosting/introduction/), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Open-Meteo](https://open-meteo.com/en/pricing).

## Entornos y configuración

- **Local:** datos de prueba, Metro y servidor IA en loopback. Nunca exponer el proxy actual por un túnel público.
- **Staging:** proyecto Supabase separado, claves y cuotas pequeñas, usuarios de prueba, fotos sintéticas, build de prueba y canal de actualización propio.
- **Producción:** proyecto y credenciales independientes, dominio, contactos reales y políticas de datos aprobadas. Las variables `EXPO_PUBLIC_` son públicas dentro del bundle; no alojan secretos.

Antes de vincular EAS, elegir propietario del producto e identificadores definitivos. Hoy falta `ios.bundleIdentifier`; Android usa `com.armatuoutfit.prototype`. Reservar identificadores de desarrollo distintos y acordar los de tiendas antes de la primera subida. Añadir icono, splash, permisos, `scheme`, versiones y perfiles `development`, `preview`, `production` en `eas.json` al ejecutar esta fase. Registrar credenciales y recuperación en un gestor seguro, no en el repositorio.

## Camino de distribución

| Paso | Entrega | Criterio de salida |
|---|---|---|
| 1. Prueba personal | Expo Go compatible y [guía de iPhone](prueba-iphone.md) | Cámara, permisos, foto y datos después de cierre; registro de resultados reales. |
| 2. Build propia | Development build para depurar módulos y preview instalable sin Metro | Permisos del producto, arranque frío sin red, teclado, accesibilidad y persistencia en iPhone/Android. |
| 3. Staging cloud | Cuenta, respaldo, borrado y análisis autenticado | Aislamiento entre cuentas, restauración y costos acotados verificados. No habilitar endpoints públicos sin estas protecciones. |
| 4. Beta | TestFlight y pista interna/cerrada de Play | Pruebas con personas, fallos reproducibles resueltos y soporte operativo. |
| 5. Producción | Binarios firmados, fichas completas y revisión de tiendas | Aprobación de cada tienda y decisión explícita de liberar. Lanzamiento gradual y revisión de errores. |

Se puede distribuir una beta solo local antes del paso cloud, indicando que no hay respaldo. Publicar cuentas cambia las obligaciones de eliminación y privacidad. Subir una build y publicarla son pasos distintos: en iOS EAS Submit la entrega a TestFlight; en Android se elige pista y estado. Usar `draft` para evitar un rollout accidental. [EAS Submit](https://docs.expo.dev/deploy/submit-to-app-stores/).

## Apple

1. Inscribir al titular correcto en Apple Developer Program; resolver identidad y, para organización, requisitos empresariales. La membresía figura en **99 USD/año**, con variación regional. [Inscripción](https://developer.apple.com/programs/enroll/).
2. Crear Bundle ID y registro en App Store Connect; configurar firma y versiones. Probar la build en un iPhone físico. Expo Go no verifica los textos de permisos configurados para el binario propio.
3. Subir a TestFlight. Empezar con testers internos; la distribución externa puede requerir revisión de beta. Preparar instrucciones de prueba y acceso del revisor si hay cuenta. [TestFlight](https://developer.apple.com/testflight/).
4. Completar nombre, categoría, edad, capturas reales, soporte, política de privacidad y declaraciones de datos según el flujo implementado: cuenta, fotos, ciudad e intercambio con IA. Mantener el consentimiento específico antes de enviar una foto.
5. Si hay creación de cuentas, permitir iniciar su eliminación dentro de la app. Si se añade login social, revisar la regla 4.8. Resolver preguntas de cifrado/exportación según la build efectiva. [Revisión](https://developer.apple.com/app-store/review/guidelines/), [eliminación](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
6. Enviar a App Review y liberar después de la aprobación. Las suscripciones digitales requerirán evaluar las reglas de compra vigentes por región antes de elegir un proveedor; no forman parte del piloto.

## Google Play

1. Crear Play Console con el titular y tipo de cuenta correctos; completar verificación de identidad y dispositivo cuando corresponda. La inscripción figura en **25 USD, pago único**. [Registro](https://support.google.com/googleplay/android-developer/answer/6112435).
2. Reservar el nombre de paquete definitivo; generar AAB, configurar Play App Signing y proteger la clave de subida. Probar primero en pista interna y en un Android físico.
3. Para cuentas personales creadas después del 13/11/2023, la regla consultada exige al menos **12 testers inscritos continuamente durante 14 días** en prueba cerrada antes de solicitar acceso a producción. Cumplir el plazo permite solicitarlo, no garantiza aprobación. [Requisitos de prueba](https://support.google.com/googleplay/android-developer/answer/14151465).
4. Completar ficha, clasificación, Data safety, acceso de revisión y política de privacidad. Si se crean cuentas, proporcionar eliminación desde la app y enlace web para solicitarla. [Eliminación de cuentas](https://support.google.com/googleplay/android-developer/answer/13327111).
5. Revisar el target API y requisitos vigentes al preparar la release; no asumir que una exportación Expo cumple los requisitos de la tienda. Validar firma, permisos y el informe previo al lanzamiento. [Target API](https://support.google.com/googleplay/android-developer/answer/11926878).
6. Solicitar producción cuando corresponda y publicar gradualmente tras la revisión. El flujo y los resultados de iOS no sustituyen esta validación.

## Presupuesto de referencia

Importes de referencia consultados el 23/10/2026; revisar moneda, impuestos, cupos y condiciones al contratar.

| Concepto | Referencia / forma de estimarlo |
|---|---|
| Apple Developer | 99 USD/año, variación regional. |
| Google Play Console | 25 USD una vez. |
| Supabase | Free para explorar sus límites; Pro desde 25 USD/mes. Staging, compute adicional, almacenamiento y tráfico pueden aumentar el total. [Precios](https://supabase.com/pricing). |
| Expo EAS | Plan y consumo de builds, actualizaciones y hosting según uso. No asumir builds ilimitadas ni tiempos garantizados en Free. [Precios](https://expo.dev/pricing). |
| IA, correo y clima comercial | Calcular por solicitudes, imágenes, correos y usuarios; fijar topes antes de abrir la beta. |
| Dominio y respaldo de fotos | Cotizar dominio, almacenamiento adicional y restauraciones. No están incluidos automáticamente en el costo base de la base de datos. |

Para dimensionar fotos: 50 personas × 100 prendas × 0.5 MB ≈ 2.5 GB de originales, antes de miniaturas, copias y tráfico. Es un supuesto de planeación, no una medición actual. Registrar llamadas y errores de IA sin guardar imágenes ni tokens; cortar solicitudes al llegar al presupuesto configurado y conservar alta manual.

## Releases, recuperación y operación

- Fijar dependencias y ejecutar TypeScript, tests, exportación y prueba nativa antes de construir. Revisar avisos de dependencias antes de distribuir; esta entrega no convierte el prototipo en una release auditada.
- CI propuesta: checks → staging → prueba en dispositivos → aprobación de release → producción. Todavía no hay pipeline ni automatización de publicación configurados.
- OTA solo para JavaScript/recursos compatibles con la build. Usar `runtimeVersion` y canales separados; cambios nativos o permisos exigen otro binario. Una actualización OTA no sustituye la revisión que requiera la tienda. [Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/).
- Conservar la build anterior y poder detener un rollout. Una vuelta atrás de JavaScript no revierte una migración de base de datos: diseñar migraciones compatibles y recuperación separada.
- Verificar un backup restaurado, incluidos objetos de fotos. Vigilar arranque, fallos de guardado, cargas pendientes, disponibilidad de acceso y gasto. No registrar nombres de prendas, fotos ni credenciales por defecto.
- Antes de publicar: titular y soporte definidos, licencia de distribución, dominio, políticas que describan los datos reales, eliminación comprobada, secretos aislados, alertas de gasto y evidencias de ambos sistemas operativos.

Las condiciones de tiendas y proveedores cambian. Revalidar los enlaces oficiales al iniciar la fase correspondiente, especialmente compatibilidad de Expo Go, pruebas de Play, target API y requisitos de Xcode/iOS.
