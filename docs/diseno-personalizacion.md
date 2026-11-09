# Diseño y personalización

Actualizado: 9 de noviembre de 2026. Criterios de diseño de la app local de Expo, incluyendo la revisión de textos e ilustraciones. Prioridad: aprender móvil y explorar el producto. La evidencia de implementación está en [evaluación](evaluacion.md).

## Referencias y traducción al producto

- **Revolut:** su anuncio de Revolut 10, publicado el 10/10/2023, describe temas, fondos, widgets y navegación personalizables. Tomamos la idea de permitir que la persona adapte la interfaz a su uso. Es una referencia histórica oficial; no una auditoría de la app actual de 2026. [Fuente](https://www.revolut.com/blog/post/revolut-10/).
- **Resend:** su guía de diseño propone cercanía con clientes, claridad y resolver problemas concretos. Su filosofía pide una primera experiencia rápida, sin decenas de pasos. Lo traducimos en pocas decisiones, valores iniciales útiles y un resultado visible de inmediato. No copiamos su estética como sustituto de esas decisiones. [Diseño, actualizado el 27/08/2026](https://resend.com/handbook/design/how-we-think-about-design), [filosofía](https://resend.com/philosophy).
- **Tablero High Taste Apps:** [colección de Appllama](https://appllama.io/u/jaimin/high-taste-apps) revisada el 9/11/2026; solo sus pantallas de bienvenida son públicas. Fija el nivel al que apuntamos: una idea por pantalla, un protagonista grande y una sola acción principal. De daplit tomamos la idea de mostrar objetos reales como stickers, no su retícula ni sus textos.

## Dos capas, dos efectos

**Gustos para vestir** afectan el orden de las sugerencias: hasta tres estilos opcionales, colores preferidos, colores a evitar, ocasión y rotación. La disponibilidad y compatibilidad básica se respetan antes de ordenar por gusto. Un estilo no desbloquea categorías ni excluye prendas por género.

**Cómo quiero usar la app** afecta la presentación: temas Lino, Papel, Medianoche, Salvia, Chicle (rosa juguetón) y Malva (rosa empolvado); disposición Compacta o Amplia; opción de mostrar motivos. Elegir Medianoche no convierte el vestuario en oscuro, y Chicle o Malva no favorecen prendas rosas: el tema no cambia la puntuación. Ocultar motivos no oculta advertencias o errores necesarios para decidir.

Un estilo es una preferencia declarada, no una propiedad descubierta en una foto. Con los atributos actuales, el motor solo puede aproximarlo mediante reglas explicables. No inferir material, corte, marca, silueta o ajuste corporal; no decir «aprendimos tu estilo» por completar el formulario.

## Bienvenida y cuatro pasos

El onboarding es una conversación con las prendas ilustradas: en cada paso una prenda comenta en una burbuja y debajo va la pregunta, que es el encabezado para lectores de pantalla. Las ilustraciones son decorativas y se mueven solo si Reducir movimiento está apagado.

En el primer arranque, antes del paso 1, la bienvenida muestra las prendas saludando, el nombre de la app, una frase de qué hace, **Empezar** y que no hace falta cuenta. No se persiste: si la persona cierra la app a mitad del alta, vuelve al paso guardado sin repetirla. Editar preferencias no la muestra.

| Paso | Decisión | Ayuda y resultado |
|---|---|---|
| 1. Hola | Nombre opcional y qué le cuesta más al vestirse. | La respuesta no se guarda. Cada opción responde con lo que la app hace de verdad: «Nunca le atino al clima» muestra la ciudad y «Quiero cambiar de estilo» activa **Algo nuevo** al elegir un objetivo. La ubicación se pide solo al pulsar **Usar mi ubicación**. |
| 2. Tu estilo | Hasta tres estilos actuales y hasta tres a los que quiere acercarse. | Se puede continuar sin elegir. No convertir estilos en identidades fijas. |
| 3. Colores | Preferir y evitar, ambos opcionales. | Una misma opción no puede quedar en ambos grupos. Explicar que evitar un color puede reducir las combinaciones. |
| 4. Tu conjunto | Ve un conjunto con lo que eligió, ocasión habitual, apariencia y clóset propio o demo. | Con clóset vacío usa prendas de ejemplo identificadas y no las escribe en el documento. Elecciones explícitas «Vamos con mi ropa» y «Ver el clóset de ejemplo». Sin solicitudes de cámara o ubicación. |

La rotación ya no se pregunta aquí: parte de 3 días y se cambia en Mi estilo.

Mostrar «n de 4», acción principal y «Atrás». Las elecciones anteriores se conservan al volver. No bloquear por nombre, estilo o ciudad vacíos; no añadir una pantalla obligatoria de confirmación. Sin ciudad, el clima sigue siendo manual.

## Persistencia y volver a personalizar

Guardar el progreso permite cerrar y continuar en el mismo paso. Un error de guardado debe indicarse; no afirmar que quedó guardado hasta que termine. Al finalizar, las decisiones se aplican a la app y sobreviven a reiniciar.

La persona que ya tiene clóset abre «Mi estilo → Editar preferencias» y edita sus preferencias. Conservar identificadores, fotos, conjuntos guardados e historial. La elección inicial demo/propio se limita al primer arranque; volver a personalizar no es una acción de restablecimiento. Al migrar datos existentes, usar valores iniciales seguros sin obligar a repetir el alta.

## Funciones que dependen del backend

Mientras una build no tenga servicio de IA configurado (`isAiAvailable`), Analizar foto, en prendas, se muestra como «Ya casi…» y no es un control. Las alternativas manuales siguen disponibles. Web en `localhost` y las builds con `EXPO_PUBLIC_AI_API_URL` muestran la acción real.

El aviso solo aparece en desarrollo y en los perfiles `preview` y `testflight` de [eas.json](../eas.json), que definen `EXPO_PUBLIC_SHOW_COMING_SOON`. El perfil `production` lo oculta porque la [guía 2.1 de Apple](https://developer.apple.com/app-store/review/guidelines/) pide retirar el contenido provisional antes de enviar. Sube a TestFlight con `eas build --profile testflight` y a revisión con `--profile production`.

## Colorimetría

La prueba simula el drapeado de la colorimetría personal de Corea y Japón: la selfie rodeada de dos colores, lado a lado, y nueve elecciones. Decide la persona; no hay IA ni medición. La pregunta pide una piel «más uniforme» y orienta hacia ojeras, sombras y rojeces. Nunca se pide «más clara», para no premiar aclarar la piel. El resultado se presenta como «según lo que elegiste» y aclara que es una simulación.

## Tono de la app

La referencia es el [onboarding de Letterly](https://x.com/bthreeagency/status/2119753178753507565), observado en video el 9/11/2026. Tomamos su forma de comunicar, no sus frases, personajes ni pantallas de pago.

**Reglas de voz**

1. **Un personaje habla.** Las prendas son un equipo con nombre: Tere (playera), Cami (camisa), Chama (chamarra), Teni (tenis) y Bufi (bufanda). Cada una se presenta y comenta en primera persona.
2. **Burbuja y pregunta van separadas.** La burbuja es pequeña y conversa; la pregunta va sola, grande y es el encabezado para lectores de pantalla.
3. **Reacciona a lo que dices.** Usa el nombre cuando lo hay y responde a cada elección diciendo lo que la app hace de verdad.
4. **Los botones avanzan la historia.** «Vamos a tu clóset», «Ahora los colores», «Ver mi outfit». Saltar se dice sin culpa: «Lo hago después».
5. **La confianza se dice con la misma voz, sin rodeos.** «Sin cuenta. Tus datos se quedan en tu teléfono.»
6. **Cierre con nombre.** «Todo listo, Alex.»
7. **Español natural y neutro.** Cálido y de tú, sin modismos fuertes ni chistes forzados. Se dice «outfit» en lugar de «conjunto».

**Límites**

- Permisos y envío de fotos, privacidad, tono de piel, errores que afecten datos, validaciones y datos del clima se escriben claros y sin personaje.
- Humor sobre la ropa, nunca sobre la persona. Sin palabras con género para hablarle a quien usa la app; los nombres son de las prendas.
- Una voz amable no sustituye decir «clóset de ejemplo» o «prendas ficticias».
- Un mensaje de error dice primero qué pasó y qué hacer.

## Tradeoffs deliberados

- Cuatro pasos aún cuestan atención: todo lo opcional admite continuar, y los cambios se pueden hacer después.
- Seis temas aumentan la superficie de verificación: usar roles de color compartidos para paneles, campos, estados, iconos y texto; comprobar especialmente Medianoche. Cambiar solo el fondo dejaría una personalización incompleta.
- La preferencia de estilo puede mejorar el orden sin generar opciones nuevas cuando el clóset es pequeño. Probar con candidatos suficientes y reconocer ese límite.
- Preferir colores es una señal suave; evitarlos restringe. La interfaz debe explicar esa diferencia en lugar de prometer variedad ilimitada.

## Aceptación y evidencia

1. Alta desde almacenamiento vacío: completar sin nombre, estilo ni ciudad, sin que aparezca una solicitud de permisos que la persona no pidió; probar una ruta propia y otra demo por separado.
2. Elegir opciones en cada paso, retroceder y reiniciar a mitad: recuperar decisiones y paso. Finalizar, reiniciar y recuperar preferencias aplicadas.
3. Usar un clóset con varias combinaciones comparables: cambiar estilos o colores preferidos y observar una modificación explicable de puntuación/orden. Un cambio de tema no modifica el ranking. La falta de cambio con un solo candidato no prueba un fallo.
4. Con prendas, fotos, conjuntos e historial existentes: entrar a personalizar y finalizar; comparar esos datos antes y después. Ningún conjunto propio debe convertirse en demo ni desaparecer.
5. Previsualizar y aplicar todos los temas en onboarding, pantallas principales, editor y hojas. Compacta/Amplia debe cambiar la densidad o jerarquía de forma visible sin perder acciones. Texto, selección y foco deben seguir legibles.
6. Desactivar motivos: desaparece la explicación opcional, permanecen advertencias de disponibilidad, compatibilidad y almacenamiento.

Separar evidencia de **código**, **tests** y **uso real**. Typecheck o exportación web no prueban reinicio nativo, cámara, contraste visual ni que la persona entienda sus elecciones. Para el piloto, observar si completa el flujo sin ayuda y puede explicar qué cambió; no medir éxito solo por finalizar cuatro pantallas.

## Hoy como mesa de stickers

Las tres pestañas abren directo en su contenido, sin barra de marca; el gancho queda en la bienvenida, el onboarding y la pantalla de carga. Hoy abre en el outfit. Arriba van la fecha, el título y una píldora con el clima y la ocasión, que abre el mismo editor y sigue diciendo «manual» cuando lo es. Con clima automático, la hora del dato, Open-Meteo y **Actualizar clima** quedan al final de la pantalla.

Cada idea ocupa una página: se desliza o se tocan los puntos de «1 de 3». Las prendas van como stickers sobre el mismo fondo de puntos del perchero, un poco giradas y grandes; tocar una abre su cambio. Debajo hay una sola acción principal, **Hoy me lo puse**, con Guardar y **Prefiero otro** como botones de icono. Los tres actúan sobre la idea que está a la vista. **Otra vuelta** y **Elegir con IA** quedan debajo, como acciones secundarias.

| Prenda | Sticker |
|---|---|
| Con recorte (propio o de ejemplo) | La foto sin fondo con un borde claro alrededor. |
| Con foto sin recortar | La foto en un marco claro cuadrado. |
| Sin foto | El dibujo genérico sin carita, sobre su propio papel. Para lectores de pantalla sigue siendo «Ilustración genérica». |

El papel del sticker es claro en todos los temas, como un sticker real sobre cualquier superficie; por eso el dibujo no se tiñe con el tema en Hoy. Los colores de la prenda siguen aparte, en la etiqueta con su nombre.

Los motivos van en una burbuja con la voz de las prendas, como en el onboarding: «Hoy vamos en plan urbano.» en lugar de «Estilo: urbano». [reasonVoice.ts](../src/domain/reasonVoice.ts) reescribe cada motivo sin añadir afirmaciones; uno que no conoce se muestra tal cual. Se dicen hasta dos. Las advertencias no cambian de voz ni se ocultan al desactivar los motivos.

**Algo nuevo** aparece junto al indicador de páginas cuando hay un objetivo de estilo; para lectores de pantalla se llama «Hoy me animo a algo nuevo». El aviso de categorías faltantes solo se muestra con ese modo encendido.

La altura de la mesa se calcula con la pantalla para que la acción principal quede a la vista sin desplazarse en un teléfono de 812 puntos; en pantallas más bajas la pantalla se desplaza. La disposición Compacta usa una mesa más baja.

## Mi estilo como tablero

Mi estilo deja de ser una lista de paneles con botón. Arriba, sobre el mismo fondo de puntos, van los estilos como stickers de palabra: **Así me visto** abre Editar preferencias y **Quiero probar** abre la hoja Cambiar mi estilo; los de objetivo llevan «✦», como Algo nuevo en Hoy. Sin estilos elegidos, cada fila muestra un hueco punteado que dice qué elegir. Cada fila es un solo botón con su texto de acción.

Debajo, **Guardados** es una fila que se desliza con cada outfit como collage pequeño; tocar uno abre el outfit. A ese tamaño los recortes van sin borde, porque mediría menos de un píxel.

**Colores** usa el mismo selector del onboarding ([ColorPicker.tsx](../src/components/ColorPicker.tsx)): una pestaña para «Me gustan» y otra para «Prefiero evitar» sobre una sola cuadrícula, en lugar de dos listas de doce. **Apariencia** muestra los temas en una fila que se desliza; cada tarjeta es una mini pantalla de Hoy con su paleta y los stickers. Repetición de prendas y Almacenamiento cierran la pantalla sin cambios de contenido.

## Mi clóset como perchero

Inspirado en el perchero del portafolio de Batch Merch (Inspora, «portfolio website»): fondo claro con puntos, un tubo cromado y prendas colgadas de canto. La prenda elegida gira de frente (`rotateY` con perspectiva, 320 ms, sin animación con Reducir movimiento) y debajo aparece su nombre, categoría, colores, «Ejemplo» si aplica, el interruptor de disponibilidad y **Editar prenda**. Arriba, capas, prendas completas y abajo cuelgan del tubo con un largo aproximado por categoría; calzado y accesorios van en una repisa.

El perchero se usa mientras el clóset tiene únicamente prendas de ejemplo. En cuanto hay ropa propia, Mi clóset cambia a una cuadrícula de fotos cuadradas de 3 columnas con filtros por categoría, que admite fotos con cualquier fondo. El efecto del perchero depende de fotos sin fondo. El clóset de ejemplo usa fotos de Unsplash recortadas con Apple Vision ([créditos](../assets/demo/README.md)). Una prenda propia sin foto usa su dibujo con un gancho dibujado; una foto propia con fondo se ve, pero no tan limpia: recortarla en el teléfono requiere un módulo nativo y una build de desarrollo. El clóset vacío ofrece **Ver el clóset de ejemplo** como elección explícita.

## Agregar prenda

Lo esencial va primero: foto opcional, categoría y colores. El nombre es opcional; si queda vacío se guarda «Categoría · color» (p. ej. «Capa exterior · café»), con separador para no forzar concordancia de género. Una prenda nueva empieza sin color para no guardar «Negro» por accidente.

Con una foto elegida, en iOS 17+ con la build de desarrollo aparece **Quitar fondo** (se hace en el teléfono; la foto no se envía). El resultado se ve en la vista previa; **Usar original** lo descarta. La cuadrícula, Hoy y el perchero prefieren el recorte. [ADR-006](adr/0006-recorte-de-fondo-en-dispositivo.md).

Ocasiones, abrigo, lluvia y estilos quedan en **Más detalles**, plegado y con un resumen de los valores actuales. El abrigo inicial depende de la categoría hasta que la persona elige uno. **Disponible** solo aparece al editar: una prenda nueva se agrega disponible y el clóset ya permite cambiarlo. No se añaden campos que el recomendador no use (marca, talla, material); cada uno es fricción sin efecto en las sugerencias.

## Texto e ilustraciones

Usar títulos, acciones y ayudas breves. Se retiraron eslóganes, títulos promocionales de conjuntos y descripciones decorativas de estilos y temas. Los errores, restricciones y advertencias que ayudan a decidir permanecen visibles.

Las nueve ilustraciones de prendas siguen las referencias de Café Sinónimo aportadas por el usuario: una tinta, trazo redondo e irregular, espacios transparentes y caras pequeñas. Comparten recursos entre el clóset, los conjuntos y las vistas de apariencia. La tinta adapta el dibujo al tema; las muestras de color describen la prenda. Las fotos se muestran sin tintado.

En Hoy cada dibujo se muestra como sticker: la misma ilustración sin carita sobre una silueta clara con borde troquelado. La carita se queda en el onboarding, donde las prendas hablan. Los nueve stickers se generan con [garment-stickers.py](../scripts/garment-stickers.py) a partir de los originales, que no cambian.

Los dibujos son genéricos; su selección por categoría y algunas palabras del nombre no analiza la foto ni infiere estilo. La biblioteca todavía no distingue todos los tipos de prendas. [Archivos y prompts](../assets/garments/README.md). El nombre visible «Amplia» conserva el identificador persistido `editorial` para evitar un cambio de esquema innecesario.

El gancho con destello es la marca de Arma tu outfit. En el onboarding, la bienvenida y la pantalla de carga, el gancho usa el color de texto y el destello usa el acento del tema. El icono de la app conserva su fondo verde claro. [Propuesta vectorial](../assets/brand/propuestas/02-en-el-gancho.svg) · [Icono](../assets/brand/app-icon.png).
