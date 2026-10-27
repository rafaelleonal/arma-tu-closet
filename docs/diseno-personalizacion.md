# Diseño y personalización

Actualizado: 23 de octubre de 2026. Criterios de diseño de la app local de Expo, incluyendo la revisión de textos e ilustraciones. Prioridad: aprender móvil y explorar el producto. La evidencia de implementación está en [evaluación](evaluacion.md).

## Referencias y traducción al producto

- **Revolut:** su anuncio de Revolut 10, publicado el 10/10/2023, describe temas, fondos, widgets y navegación personalizables. Tomamos la idea de permitir que la persona adapte la interfaz a su uso. Es una referencia histórica oficial; no una auditoría de la app actual de 2026. [Fuente](https://www.revolut.com/blog/post/revolut-10/).
- **Resend:** su guía de diseño propone cercanía con clientes, claridad y resolver problemas concretos. Su filosofía pide una primera experiencia rápida, sin decenas de pasos. Lo traducimos en pocas decisiones, valores iniciales útiles y un resultado visible de inmediato. No copiamos su estética como sustituto de esas decisiones. [Diseño, actualizado el 27/08/2026](https://resend.com/handbook/design/how-we-think-about-design), [filosofía](https://resend.com/philosophy).

## Dos capas, dos efectos

**Gustos para vestir** afectan el orden de las sugerencias: hasta tres estilos opcionales, colores preferidos, colores a evitar, ocasión y rotación. La disponibilidad y compatibilidad básica se respetan antes de ordenar por gusto. Un estilo no desbloquea categorías ni excluye prendas por género.

**Cómo quiero usar la app** afecta la presentación: temas Lino, Papel, Medianoche, Salvia, Chicle (rosa juguetón) y Malva (rosa empolvado); disposición Compacta o Amplia; opción de mostrar motivos. Elegir Medianoche no convierte el vestuario en oscuro, y Chicle o Malva no favorecen prendas rosas: el tema no cambia la puntuación. Ocultar motivos no oculta advertencias o errores necesarios para decidir.

Un estilo es una preferencia declarada, no una propiedad descubierta en una foto. Con los atributos actuales, el motor solo puede aproximarlo mediante reglas explicables. No inferir material, corte, marca, silueta o ajuste corporal; no decir «aprendimos tu estilo» por completar el formulario.

## Bienvenida y cuatro pasos

En el primer arranque, antes del paso 1, una bienvenida muestra tres ilustraciones, el nombre de la app, una frase de qué hace, **Empezar** y que no hace falta cuenta. No se persiste: si la persona cierra la app a mitad del alta, vuelve al paso guardado sin repetirla. Editar preferencias no la muestra.

| Paso | Decisión | Ayuda y resultado |
|---|---|---|
| 1. Tu estilo | Nombre opcional y hasta tres estilos; poder continuar sin elegir. | «Elige hasta 3». No convertir estilos en identidades fijas. |
| 2. Colores | Preferir y evitar, ambos opcionales. | Una misma opción no puede quedar en ambos grupos. Explicar que evitar un color puede reducir las combinaciones. |
| 3. Tu rutina | Ocasión inicial, cuánto desea variar y ciudad del clima (opcional). | Valores iniciales visibles. Rotación suave: recordar repeticiones, permitir volver a usarlas. La ubicación se pide solo al pulsar **Usar mi ubicación**; la búsqueda por nombre queda disponible. |
| 4. Apariencia | Vista previa de tema y disposición; motivos; empezar con clóset propio vacío o demo. | Cambiar tema debe transformar la vista previa. Elecciones explícitas «Empezar con mi ropa» y «Usar clóset de ejemplo». Sin solicitudes de cámara o ubicación. |

Mostrar «n de 4», acción principal y «Atrás». Las elecciones anteriores se conservan al volver. No bloquear por nombre, estilo o ciudad vacíos; no añadir una pantalla obligatoria de confirmación. Sin ciudad, el clima sigue siendo manual.

## Persistencia y volver a personalizar

Guardar el progreso permite cerrar y continuar en el mismo paso. Un error de guardado debe indicarse; no afirmar que quedó guardado hasta que termine. Al finalizar, las decisiones se aplican a la app y sobreviven a reiniciar.

La persona que ya tiene clóset abre «Mi estilo → Editar preferencias» y edita sus preferencias. Conservar identificadores, fotos, conjuntos guardados e historial. La elección inicial demo/propio se limita al primer arranque; volver a personalizar no es una acción de restablecimiento. Al migrar datos existentes, usar valores iniciales seguros sin obligar a repetir el alta.

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

## Agregar prenda

Lo esencial va primero: foto opcional, categoría y colores. El nombre es opcional; si queda vacío se guarda «Categoría · color» (p. ej. «Capa exterior · café»), con separador para no forzar concordancia de género. Una prenda nueva empieza sin color para no guardar «Negro» por accidente.

Ocasiones, abrigo, lluvia y estilos quedan en **Más detalles**, plegado y con un resumen de los valores actuales. El abrigo inicial depende de la categoría hasta que la persona elige uno. **Disponible** solo aparece al editar: una prenda nueva se agrega disponible y el clóset ya permite cambiarlo. No se añaden campos que el recomendador no use (marca, talla, material); cada uno es fricción sin efecto en las sugerencias.

## Texto e ilustraciones

Usar títulos, acciones y ayudas breves. Se retiraron eslóganes, títulos promocionales de conjuntos y descripciones decorativas de estilos y temas. Los errores, restricciones y advertencias que ayudan a decidir permanecen visibles.

Las nueve ilustraciones de prendas siguen las referencias de Café Sinónimo aportadas por el usuario: una tinta, trazo redondo e irregular, espacios transparentes y caras pequeñas. Comparten recursos entre el clóset, los conjuntos y las vistas de apariencia. La tinta adapta el dibujo al tema; las muestras de color describen la prenda. Las fotos se muestran sin tintado.

Los dibujos son genéricos; su selección por categoría y algunas palabras del nombre no analiza la foto ni infiere estilo. La biblioteca todavía no distingue todos los tipos de prendas. [Archivos y prompts](../assets/garments/README.md). El nombre visible «Amplia» conserva el identificador persistido `editorial` para evitar un cambio de esquema innecesario.
