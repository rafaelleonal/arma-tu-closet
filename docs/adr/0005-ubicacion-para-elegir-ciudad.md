# ADR-005 — Ubicación aproximada para elegir la ciudad del clima

- Fecha: 2026-10-27
- Estado: aceptada para el prototipo local
- Sustituye: la frase «No pedir GPS» de [ADR-004](0004-servicios-externos-opcionales.md); el resto de ADR-004 sigue vigente
- Alcance: `expo-location`, permiso en primer plano y selección de ciudad

## Contexto

Escribir y elegir la ciudad era el paso que más frenaba el clima automático. La persona pidió solicitar la ubicación para encontrar la ciudad en la que usa la app y, si no da permiso, conservar la búsqueda manual. El esquema `weather` ya guarda una ciudad de Open-Meteo con su identificador, zona horaria y coordenadas.

## Decisión

En iOS y Android, el botón **Usar mi ubicación** pide permiso de ubicación en primer plano solo al pulsarlo. Con permiso, se toma una posición de baja precisión (o la última conocida de menos de 30 minutos), el sistema operativo la traduce a un nombre de ciudad y ese nombre se busca en el geocodificador de Open-Meteo. Se elige el resultado más cercano a menos de 50 km; si no hay coincidencia, se ofrece la búsqueda por nombre.

Se guarda solo la ciudad de Open-Meteo, con sus propias coordenadas. La posición del dispositivo no se persiste ni se envía a Open-Meteo. No hay ubicación en segundo plano ni seguimiento: la ciudad no cambia sola al moverse. En iOS la precisión reducida es la predeterminada y no se solicita precisión completa.

Denegar el permiso, tener la ubicación desactivada o no encontrar la ciudad abre la búsqueda por nombre con un mensaje. Si el permiso quedó bloqueado, se ofrece **Abrir Ajustes**. En web no se ofrece el botón porque `reverseGeocodeAsync` solo existe en iOS y Android.

## Alternativas

| Alternativa | Motivo para descartarla ahora |
|---|---|
| Enviar las coordenadas del dispositivo a Open-Meteo y guardar «Mi ubicación» | Persistiría una posición personal y requeriría un identificador sintético en `WeatherLocation`, que hoy proviene del geocodificador. |
| Pedir el permiso al abrir la app | Una solicitud sin contexto suele rechazarse y no es necesaria para usar el clóset. |
| Seguir la ubicación en segundo plano | Más permisos, batería y riesgo de privacidad para un dato que cambia poco. |
| Geolocalización del navegador en web | Sin geocodificación inversa no hay nombre de ciudad que mostrar ni buscar. |

## Consecuencias y revisión

Se añade una dependencia nativa incluida en Expo Go. Una build propia aplica los textos de permiso de `app.json`; Expo Go muestra los suyos. La geocodificación inversa usa el servicio del sistema (Apple o Google) y puede fallar sin red o devolver un nombre que Open-Meteo no conoce; la búsqueda manual cubre esos casos.

Revisar si la coincidencia por nombre falla con frecuencia en ciudades pequeñas o si se necesita actualizar la ciudad al viajar. Antes de distribuir, declarar el uso de ubicación en las fichas de las tiendas.

## Referencias

- [Código: deviceLocation.ts](../../src/weather/deviceLocation.ts), [CityPicker.tsx](../../src/components/CityPicker.tsx), [nearestLocation](../../src/weather/openMeteo.ts).
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/), [integraciones](../integraciones.md).
