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

Sigue la misma base que el resto de la app. Las prendas que hablan son stickers con su carita sobre el fondo de puntos, y lo que dicen va en la misma burbuja de Hoy, con la cola hacia quien habla. En la bienvenida el fondo de puntos ocupa toda la pantalla; en cada paso es una franja de borde a borde. Los estilos se eligen como stickers de palabra: cada opción es un hueco punteado con «+» y, al elegirla, queda el sticker con «✓», o con «✦» si es un estilo que la persona quiere probar, igual que en Mi estilo. El hueco y el sticker miden lo mismo, así que elegir no mueve el resto. El primer outfit se muestra como collage de stickers sobre puntos, con sus motivos en la voz de las prendas; con el clóset de ejemplo lleva la etiqueta «Ejemplo con prendas ficticias» y omite los motivos sobre uso, porque nadie ha usado esas prendas. En el pie, la acción principal es una píldora, **Lo hago después** queda al centro y **Atrás** es un botón redondo con flecha.

En el primer arranque, antes del paso 1, la bienvenida muestra las prendas saludando, el nombre de la app, una frase de qué hace, **Empezar** y que no hace falta cuenta. No se persiste: si la persona cierra la app a mitad del alta, vuelve al paso guardado sin repetirla. Editar preferencias no la muestra.

| Paso | Decisión | Ayuda y resultado |
|---|---|---|
| 1. Hola | Nombre opcional y qué le cuesta más al vestirse. | La respuesta no se guarda. Cada opción responde con lo que la app hace de verdad: «Nunca le atino al clima» muestra la ciudad y «Quiero cambiar de estilo» activa **Algo nuevo** al elegir un objetivo. La ubicación se pide solo al pulsar **Usar mi ubicación**. |
| 2. Tu estilo | Hasta tres estilos actuales y hasta tres a los que quiere acercarse. | Se puede continuar sin elegir. No convertir estilos en identidades fijas. |
| 3. Colores | Preferir y evitar, ambos opcionales. | Una misma opción no puede quedar en ambos grupos. Explicar que evitar un color puede reducir las combinaciones. |
| 4. Tu conjunto | Ve un conjunto con lo que eligió, ocasión habitual, apariencia y clóset propio o demo. | Con clóset vacío usa prendas de ejemplo identificadas y no las escribe en el documento. Elecciones explícitas «Vamos con mi ropa» y «Ver el clóset de ejemplo». Sin solicitudes de cámara o ubicación. |

La rotación ya no se pregunta aquí: parte de 3 días y se cambia en Mi estilo → Ajustes.

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
- Los interruptores pasan por [Toggle.tsx](../src/components/Toggle.tsx): en web el componente estándar no dibuja el riel apagado y pone un botón verde azulado que no pertenece a ningún tema.
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

Las tres pestañas abren directo en su contenido, sin barra de marca; el gancho queda en la bienvenida, el onboarding y la pantalla de carga. Hoy abre en el outfit. Arriba van la fecha, el título y una píldora con el clima y la ocasión, que abre el mismo editor y sigue diciendo «manual» cuando lo es. Con clima automático y dato reciente no hay nada más que decir: la app lo renueva sola. Solo cuando falta el dato aparece, bajo las acciones, una línea sin personaje que dice por qué y que se usa el clima manual, con **Actualizar** al lado.

Cada idea ocupa una página: se desliza o se tocan los puntos de «1 de 3». Las prendas van como stickers sobre un fondo de puntos, un poco giradas y grandes; tocar una abre su cambio. Debajo hay una sola acción principal, **Hoy me lo puse**, con Guardar y **Prefiero otro** como botones de icono. Los tres actúan sobre la idea que está a la vista.

Bajo esas acciones queda lo menos posible, y nada con forma de botón que compita con la principal ([TodayScreen.tsx](../src/screens/TodayScreen.tsx)):

- **Otra vuelta** es una fila con la prenda que la persona quiere usar más como sticker pequeño, su nombre y una flecha; abre Combínala ([WearMoreNudge.tsx](../src/components/today/WearMoreNudge.tsx)). Sin prenda marcada no aparece.
- **Elegir con IA**, que solo existe en desarrollo, es un enlace de texto. Mientras consulta dice «Consultando…»; si la IA eligió, lo dice en una línea; si falló, también.
- El aviso de clima descrito arriba, solo cuando falta el dato.

Con clima manual y sin prenda marcada, la pantalla termina en **Hoy me lo puse**.

Al aparecer, cada sticker «se pega»: llega un poco más grande y girado, y se asienta en unos 0,3 s ([StickerIn.tsx](../src/components/StickerIn.tsx)). En un grupo caen en orden, uno cada 60 ms. Ocurre una vez, cuando el sticker se muestra por primera vez: al abrir Hoy o una hoja con su mesa, al pedir otras ideas, al cambiar una prenda y al elegir una en Armar outfit. En el álbum solo se mueven los primeros doce, lo que cabe en una pantalla, para que un clóset largo no cueste nada. Deslizar entre ideas no lo repite. Con Reducir movimiento los stickers simplemente están. Solo se mueve el dibujo: el botón que lo rodea no cambia de lugar.

| Prenda | Sticker |
|---|---|
| Con recorte (propio o de ejemplo) | La foto sin fondo con un borde claro alrededor. |
| Con foto sin recortar | La foto en un marco claro cuadrado. |
| Sin foto | El dibujo genérico sin carita, sobre su propio papel. Para lectores de pantalla sigue siendo «Ilustración genérica». |

El papel del sticker es claro en todos los temas, como un sticker real sobre cualquier superficie; por eso el dibujo no se tiñe con el tema en Hoy. Lo único del tema que se escribe sobre ese papel es la marca de un sticker de palabra («✦» o «✓»): usa el rol `stickerMark`, que en los temas claros es su acento y en Medianoche conserva el de Lino, porque un acento pensado para fondo oscuro no se lee sobre papel claro. Un test comprueba ese contraste en los seis temas. En iOS cada sticker se rasteriza (`shouldRasterizeIOS`): se dibuja una vez con su borde y su sombra y se reutiliza al desplazarse, porque la sombra de una vista sin fondo es costosa de calcular en cada cuadro. Los colores de la prenda siguen aparte, en la etiqueta con su nombre.

Los motivos van en una burbuja con la voz de las prendas, como en el onboarding: «Hoy vamos en plan urbano.» en lugar de «Estilo: urbano». [reasonVoice.ts](../src/domain/reasonVoice.ts) reescribe cada motivo sin añadir afirmaciones; uno que no conoce se muestra tal cual. Se dicen hasta dos. Las advertencias no cambian de voz ni se ocultan al desactivar los motivos.

**Algo nuevo** aparece junto al indicador de páginas cuando hay un objetivo de estilo; para lectores de pantalla se llama «Hoy me animo a algo nuevo». El aviso de categorías faltantes solo se muestra con ese modo encendido.

La altura de la mesa se calcula con la pantalla para que la acción principal quede a la vista sin desplazarse en un teléfono de 812 puntos; en pantallas más bajas la pantalla se desplaza. La disposición Compacta usa una mesa más baja.

## Mi estilo como tablero

Mi estilo deja de ser una lista de paneles con botón. Arriba, sobre el mismo fondo de puntos, van los estilos como stickers de palabra: **Así me visto** abre Editar preferencias y **Quiero probar** abre la hoja Cambiar mi estilo; los de objetivo llevan «✦», como Algo nuevo en Hoy. Sin estilos elegidos, cada fila muestra un hueco punteado que dice qué elegir. Cada fila es un solo botón con su texto de acción.

Debajo, **Guardados** es una fila que se desliza con cada outfit como collage pequeño; tocar uno abre el outfit. A ese tamaño los recortes van sin borde, porque mediría menos de un píxel.

**Colores** usa el mismo selector del onboarding ([ColorPicker.tsx](../src/components/ColorPicker.tsx)): una pestaña para «Me gustan» y otra para «Prefiero evitar» sobre una sola cuadrícula, en lugar de dos listas de doce.

La pantalla termina ahí: estilos, guardados y colores son lo que describe a la persona. Lo que solo cambia cómo se ve o se comporta la app va en la hoja **Ajustes** ([SettingsSheet.tsx](../src/screens/SettingsSheet.tsx)), que se abre con el botón redondo junto al título:

- **Tema**: los temas en una fila que se desliza; cada tarjeta es una mini pantalla de Hoy con su paleta y los stickers. La fila abre en el tema en uso, con un poco del anterior a la vista.
- **Vista**, **Explicaciones** y, en el teléfono, **Vibración**.
- **Esperar para repetir una prenda**: Nada, 3, 7 o 14 días. La etiqueta sustituye al párrafo que lo explicaba.
- **Tus datos**: tres frases sin personaje sobre dónde se guarda todo, qué pasa al borrar la app y que solo Analizar foto envía la foto de una prenda a OpenAI. Debajo, cuántas prendas propias y usos hay, y el crédito de Open-Meteo que pide su licencia.

Un cambio en la hoja se guarda al tocarlo, como antes en la pantalla; no hay botón de aplicar.

## Mi clóset como álbum

Toda la ropa, de ejemplo o propia, se ve como un álbum de stickers de 3 columnas con filtros por categoría, sobre el fondo de puntos: el recorte con borde claro, la foto con cualquier fondo en un marco, o el dibujo sin carita si la prenda no tiene foto. Los stickers van un poco girados, el nombre ocupa hasta dos líneas y una prenda en lavandería se ve atenuada con su etiqueta. Tocar un sticker abre la prenda. Para que un clóset largo no pese, el borde de los recortes pequeños se dibuja con cuatro copias de la imagen en lugar de ocho. Recortar una foto propia en el teléfono requiere un módulo nativo y una build de desarrollo.

El clóset de ejemplo usó hasta el 10/11/2026 un perchero con prendas colgadas de canto que giraban de frente al elegirlas. Se retiró a petición de la persona después de probarlo en su teléfono: la animación no convencía y era la única pantalla que no seguía la base de stickers. Con él se fueron el panel de la prenda elegida y su interruptor de disponibilidad en esa vista; la disponibilidad se cambia en el editor.

El clóset vacío muestra, en una burbuja, lo que necesita un outfit y tres stickers de dibujo (arriba, abajo y calzado); debajo van **Agregar prenda** y **Ver el clóset de ejemplo**, que sigue siendo una elección explícita. La cuenta de prendas va sobre el título y **+ Agregar prenda** a su lado.

En desarrollo, abajo a la izquierda hay una etiqueta pequeña «Prueba: Actual» que abre el selector de clósets de prueba ([CONTRIBUTING](../CONTRIBUTING.md)). Una app publicada no la muestra.

## Las hojas

Las hojas siguen la misma base que las pestañas: la prenda como sticker sobre el fondo de puntos y una acción principal. Usan el mismo margen lateral que una pantalla, para que la mesa y los álbumes lleguen a los dos bordes. Cuando la acción principal cierra un formulario o una selección larga, va fija al pie de la hoja y no al final del contenido.

| Hoja | Qué muestra |
|---|---|
| **Tu outfit** | La misma mesa de Hoy con una sola idea: burbuja con los motivos, stickers que abren su cambio, Guardar y **Hoy me lo puse**. Sin **Prefiero otro**, porque no hay otra idea que la reemplace. Un guardado conserva su aviso de detalles originales. |
| **Cambiar** | Un álbum de stickers de tres columnas con las prendas que pueden entrar. Arriba dice a cuál reemplazan y que solo hay prendas disponibles, sin los colores que la persona evita. |
| **Combínala** | Las ideas en páginas, como en Hoy. La prenda elegida lleva la etiqueta invertida y no se toca; las demás abren su cambio. Al cerrar un cambio se vuelve a la idea que estaba a la vista. |
| **Armar outfit** | Arriba, fija, una mesa pequeña con el outfit que se va formando: un sticker por prenda elegida y un hueco punteado con el nombre de cada categoría obligatoria que falta. Debajo, cada categoría es una fila de stickers que se desliza; tocar uno lo elige o lo quita, y el elegido lleva una palomita. **Guardar outfit** va al pie; si falta algo, dice qué categoría. |
| **Agregar o editar prenda** | Arriba, la prenda como el sticker que verá el resto de la app, con su etiqueta de colores y nombre; cambia al elegir foto, categoría o color. **Guardar** va al pie. Al cerrar con cambios, la pregunta **¿Descartar cambios?** ocupa ese mismo pie. |

En iPhone la hoja empieza bajo la barra de estado y su pie deja libre el indicador de inicio. Con el teclado arriba, el pie queda pegado al teclado y el campo de nombre del editor se desplaza para quedar a la vista. El fondo de puntos se dibuja con el tamaño medido de su contenedor, no con porcentajes: en nativo un porcentaje deja fuera el margen interior y no sigue a un contenedor que crece.

El compositor sigue eligiendo por categorías; no es un lienzo para arrastrar prendas. Las hojas de colorimetría y Cambiar mi estilo no cambian de contenido.

**Clima y ocasión** pide solo lo que cambia una sugerencia, en el orden en que más se toca: primero la ocasión; después el clima, con dos pestañas. En **Manual** hay una tarjeta con la temperatura, que se sube o baja con dos botones y sigue cambiando si se mantienen pulsados, y el interruptor de lluvia. En **Automático** va la ciudad en una fila con **Cambiar**, que despliega la búsqueda y **Usar mi ubicación** con su aviso de privacidad, y una línea que dice qué clima manual se usa cuando no hay dato reciente, con **Cambiar** para ajustarlo. **Aplicar** va al pie. Ya no se preguntan la ciudad en modo manual ni la estación: ninguna sugerencia las usa, y sus valores guardados se conservan. La hoja tampoco nombra al proveedor del clima; su crédito, que la licencia de los datos exige, está una sola vez en Mi estilo → Almacenamiento.

## Agregar prenda

Lo esencial va primero y se elige mirando, no leyendo listas: la foto, que es opcional; **¿Qué es?**, con los seis dibujos de la app como stickers, donde el elegido queda a color con su palomita y los demás atenuados; y **¿De qué color?**, con las doce muestras en dos filas, cada una con su nombre debajo para no depender solo del color. Una prenda nueva empieza sin color para no guardar «Negro» por accidente.

El nombre es opcional y vive en **Más detalles**, junto a las ocasiones, el abrigo, la lluvia y los estilos; si queda vacío se guarda «Categoría · color» (p. ej. «Capa exterior · café»), con separador para no forzar concordancia de género. La etiqueta bajo el sticker de la vista previa muestra el nombre que se va a guardar.

La vista previa es un sticker sobre el fondo de puntos: el recorte con borde, la foto en su marco o, sin foto, el dibujo genérico de la categoría, que para lectores de pantalla sigue siendo «Ilustración genérica».

Con una foto elegida, en iOS 17+ con la build de desarrollo aparece **Quitar fondo** (se hace en el teléfono; la foto no se envía). El resultado se ve en la vista previa; **Usar original** lo descarta. La cuadrícula, Hoy y el perchero prefieren el recorte. [ADR-006](adr/0006-recorte-de-fondo-en-dispositivo.md).

**Más detalles** va plegado y con un resumen de los valores actuales. El abrigo inicial depende de la categoría hasta que la persona elige uno. **Disponible** solo aparece al editar: una prenda nueva se agrega disponible y el clóset ya permite cambiarlo. No se añaden campos que el recomendador no use (marca, talla, material); cada uno es fricción sin efecto en las sugerencias.

## Texto e ilustraciones

Usar títulos, acciones y ayudas breves. Se retiraron eslóganes, títulos promocionales de conjuntos y descripciones decorativas de estilos y temas. Los errores, restricciones y advertencias que ayudan a decidir permanecen visibles.

Las nueve ilustraciones de prendas siguen las referencias de Café Sinónimo aportadas por el usuario: una tinta, trazo redondo e irregular, espacios transparentes y caras pequeñas. Comparten recursos entre el clóset, los conjuntos y las vistas de apariencia. La tinta adapta el dibujo al tema; las muestras de color describen la prenda. Las fotos se muestran sin tintado.

En Hoy cada dibujo se muestra como sticker: la misma ilustración sin carita sobre una silueta clara con borde troquelado. La carita se queda en el onboarding, donde las prendas hablan: allí las seis que aparecen son stickers con carita (`stickers/crew/`). Todos se generan con [garment-stickers.py](../scripts/garment-stickers.py) a partir de los originales, que no cambian.

Los dibujos son genéricos; su selección por categoría y algunas palabras del nombre no analiza la foto ni infiere estilo. La biblioteca todavía no distingue todos los tipos de prendas. [Archivos y prompts](../assets/garments/README.md). El nombre visible «Amplia» conserva el identificador persistido `editorial` para evitar un cambio de esquema innecesario.

El gancho con destello es la marca de Arma tu outfit. En el onboarding, la bienvenida y la pantalla de carga, el gancho usa el color de texto y el destello usa el acento del tema. El icono de la app conserva su fondo verde claro. [Propuesta vectorial](../assets/brand/propuestas/02-en-el-gancho.svg) · [Icono](../assets/brand/app-icon.png).
