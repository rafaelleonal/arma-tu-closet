# Prueba en iPhone

23/10/2026 · El usuario confirmó iPhone y Expo Go instalado desde App Store. Modelo, versión de iOS y resultados de hardware pendientes.

## Compatibilidad

Actualizado 27/10/2026. El proyecto principal usa **Expo SDK 58** (React Native 0.88) y abre directamente en Expo Go: se comprobó en el simulador iPhone 15 Pro con iOS 17.5 y Expo Go instalado por `expo start --ios`, y la persona lo usa en su iPhone con Expo Go de App Store. Ya no hace falta una copia con otro SDK. [Compatibilidad oficial](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).

Para abrirlo en el teléfono:

```bash
npx expo start --go --lan
```

Expo Go sirve para probar flujo, cámara, ubicación, archivos y haptics. No valida los textos de permiso de `app.json` ni el arranque sin Metro; eso requiere una development build o una build propia, según el [plan de distribución](deploy-plan.md).

**Histórico (23/10/2026):** cuando el proyecto estaba en SDK 55 y Expo Go de App Store se quedaba en SDK 54, `scripts/prepare-expo-go-preview.mjs` preparaba una copia temporal SDK 54 servida en el puerto 8083 ([QR de entonces](evidence/expo-go-iphone-qr.png), ya caducado). El script se conserva como referencia; no se usa con SDK 58.

## Abrir en el teléfono

1. Mac y iPhone en la misma Wi-Fi, sin red de invitados que aísle dispositivos. Mantener la Mac despierta y Metro abierto.
2. Escanear el QR con Cámara de iOS y abrir Expo Go. Permitir acceso a la red local si iOS lo solicita.
3. Completar el onboarding y elegir **Empezar con mi ropa** para esta prueba. Un clóset vacío es el resultado esperado: el clóset del navegador no se sincroniza con el teléfono.
4. Si no conecta, abrir en Safari la dirección `http://<IP de la Mac>:<puerto>` que muestra Expo para comprobar acceso LAN. Si tampoco responde, revisar misma red, permiso de red local de Expo Go, IP vigente y firewall de la Mac. No borrar datos ni reinstalar Expo Go para intentar solucionarlo.
5. Si muestra incompatibilidad de SDK, actualizar Expo Go desde App Store y confirmar que el enlace sea el del proyecto principal. Registrar el mensaje y la versión de Expo Go.

El servidor de análisis no está iniciado ni expuesto. La prueba de cámara y almacenamiento es manual; no requiere clave ni llamadas reales de IA.

## Recorrido y resultados esperados

| Prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|
| Cámara permitida | Mi clóset → Agregar prenda → Tomar foto → permitir → capturar y aceptar | Vista de la foto y formulario editable; todavía no hay una prenda guardada. | Pendiente en iPhone |
| Cancelar cámara/galería | Abrir captura/selector y cancelar; repetir con una foto ya elegida | No cambia la foto anterior ni el resto de los campos. | Pendiente en iPhone |
| Cámara denegada | Si el permiso aún no se pidió, denegarlo; si ya se permitió, desactivar Cámara en los ajustes de Expo Go y volver a Tomar foto | Mensaje junto a las acciones, Abrir Ajustes cuando no se puede volver a solicitar; alta manual y galería siguen disponibles. | Pendiente en iPhone |
| Recuperar permiso | Abrir Ajustes → activar Cámara → regresar → Tomar foto | Permite capturar sin perder los campos del formulario. El sistema puede reiniciar la app al cambiar permisos; si ocurre, registrar el comportamiento. | Pendiente en iPhone |
| Galería | Elegir foto con el selector del sistema | Acceso a la selección elegida; no exigir acceso completo a la biblioteca solo para seleccionar una imagen. | Pendiente en iPhone |
| Validación | Quitar el único color, o abrir Más detalles y quitar la única ocasión, y guardar | Error junto al campo y desplazamiento hacia él. El nombre es opcional: vacío se guarda como «Categoría · color». | Web comprobado; nativo pendiente |
| Cierre accidental | Escribir nombre/cambiar foto → Cerrar → Seguir editando | Conserva cambios. Descartar cambios cierra sin modificar el clóset guardado. Un editor intacto cierra directamente. | Web comprobado; nativo pendiente |
| Guardar y cerrar | Guardar una prenda con foto y esperar **Prenda guardada**. Cerrar Expo Go desde el selector de apps; abrir el mismo proyecto | Nombre, atributos y foto siguen presentes. Repetir editando disponibilidad. | Pendiente en iPhone |
| Vibración | Cambiar pestaña o tema; guardar una prenda. Mi estilo → Apariencia → Vibración: desactivar y repetir | Selección al cambiar valor; éxito al terminar la escritura; desactivada no vibra. No vibrar por cada letra ni al tocar de nuevo la misma pestaña. | Pendiente en iPhone |
| Movimiento | Comparar con Reducir movimiento de iOS activado/desactivado | Con reducción, no hay desplazamiento de entrada, escala al pulsar ni slide de hojas. Los controles siguen respondiendo. | Pendiente en iPhone |
| Accesibilidad | VoiceOver, texto ampliado y teclado visible | Nombres y selecciones comprensibles, acciones alcanzables y sin texto cortado. | Pendiente en iPhone |

Expo Go controla sus propios textos de permisos; el texto configurado en `app.json` se prueba en una build propia. El micrófono no es necesario. La ubicación se pide solo al pulsar **Usar mi ubicación** (Hoy → Cambiar → Automático o paso Tu rutina); basta la aproximada. Probar permitir, no permitir y **Abrir Ajustes**: sin permiso debe quedar disponible la búsqueda por nombre. iOS puede omitir haptics por bajo consumo, ajustes del sistema o cámara activa; comprobarlos fuera de captura. [ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [Location](https://docs.expo.dev/versions/latest/sdk/location/), [Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/).

Las fotos se copian a documentos de la app antes de asociarlas a una prenda. El JSON se guarda con AsyncStorage y una cola de escrituras. Esperar el aviso distingue una escritura confirmada de un formulario visible. Si hay error de escritura, conservar la app abierta y reintentar: no interpretar el cierre del editor como éxito.

No desinstalar Expo Go, borrar sus datos ni cambiar de proyecto para comprobar persistencia: son escenarios diferentes y pueden perder información. El funcionamiento sin Metro y el arranque frío sin red se validarán con una build propia instalada, no se presumen de la recarga de desarrollo.

## Registrar evidencia

Anotar modelo, iOS, versión de Expo Go, SDK del proyecto, fecha y cada resultado como aprobado/fallido/no ejecutado. Si falla, registrar pasos, mensaje y si ocurrió antes o después de **Prenda guardada**. No hace falta compartir fotos personales: usar una prenda de prueba sin personas ni datos visibles.

La exportación de bundles y el manifiesto LAN están comprobados. Cámara, permisos, vibración y conservación de archivos después de cerrar Expo Go quedan pendientes hasta recibir el resultado del teléfono.

## Punto de pausa

El usuario pidió pausar el 23/10/2026 y confirmó que todavía no hizo la prueba. Se detuvo Metro de la copia: el QR guardado no estará operativo hasta reiniciarlo. La copia preparada está en `/var/folders/3k/xsbqq6zd5nncvmnfyxkzq1j00000gn/T/outfit-expo54-g27aE7`; puede desaparecer por limpieza del sistema. Si ya no existe, usar de nuevo el script de preparación. Al retomar, comprobar IP y puerto, reiniciar el servidor y renovar el QR antes de pedir la prueba. No hay resultados de cámara, permisos ni persistencia en iPhone que dar por aprobados.
