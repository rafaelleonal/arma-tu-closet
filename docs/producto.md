# Arma tu outfit: primera hipótesis de producto

Fecha: 23 de octubre de 2026. El usuario confirmó un prototipo funcional local con Expo. Este documento define el alcance recomendado y cómo evaluarlo; no acredita que cada función esté implementada ni representa demanda validada.

La entrega final y la verificación están en el [README](../README.md) y la [evaluación](evaluacion.md). La secuencia de trabajo propuesta se mantiene en [ROADMAP](../ROADMAP.md); las etapas de este documento son hipótesis de producto. Se incluyó un compositor manual por categorías; el lienzo libre, feedback detallado y deshacer siguen como posibilidades posteriores.

**Prioridad confirmada:** aprender desarrollo móvil con React Native/Expo y explorar la idea como proyecto individual. La validación comercial es una segunda etapa; no hace falta resolver un SaaS completo para que este primer trabajo sea útil.

## Para quién y para qué

Personas que tienen ropa suficiente para su día a día, repiten combinaciones por costumbre y quieren decidir qué ponerse con menos esfuerzo. La primera selección se hace por esa necesidad, sin restringir género, edad o estilo.

**Promesa inicial:** «Elige qué ponerte hoy con ropa que ya tienes, según tu plan y cómo se siente el día». La app ofrece pocas opciones, permite cambiar cualquier pieza y registra lo que realmente se usó.

**Hipótesis:** después de registrar una pequeña parte de su clóset, una persona puede encontrar una combinación que usaría en menos de dos minutos y vuelve a hacerlo varios días. Es una hipótesis de utilidad; todavía no prueba que pagaría una suscripción.

## Primera experiencia útil

1. Ver un ejemplo opcional, identificado como demostración.
2. Agregar unas 5–8 prendas propias que sí usaría esta semana: foto desde galería o cámara, categoría y color. No digitalizar todo el clóset. La app indica qué categoría falta para formar una combinación.
3. Elegir un plan, por ejemplo trabajo, cita, amistades o familia; confirmar también el nivel de formalidad. Una cita puede ser casual y un trabajo puede exigir ropa cómoda.
4. Indicar frío, templado o calor; ver hasta tres combinaciones construidas con piezas disponibles. Si solo existe una válida, mostrar una.
5. Cambiar una prenda o fijar la que ya decidió usar. Puede guardar el conjunto o tocar «Lo usé».

Un conjunto base puede ser parte superior + parte inferior + calzado, o prenda completa + calzado. Las capas y accesorios son opcionales. No imponer pantalones ni una plantilla de vestido según el perfil de la persona.

Si no hay una combinación posible, explicar el motivo y permitir completar el clóset. La entrega incluye armado manual por categorías e intercambio de piezas. Un lienzo libre para organizar prendas sigue como posibilidad futura. Nunca inventar una prenda, presentar una compra como si fuera propia ni completar el conjunto con una imagen de catálogo sin avisar.

## Alcance del prototipo y evolución propuesta

| Etapa | Incluye | Condición para avanzar |
|---|---|---|
| **v0: alcance candidato para aprender** | App Expo local; prendas propias; foto y atributos corregibles; disponibilidad; preferencias opcionales de color; plan y temperatura manuales; sugerencias con reglas transparentes; intercambiar piezas; guardar conjuntos y confirmar uso. Datos persistidos en el dispositivo. | El flujo funciona y permite aprender; después se prueba con personas y ropa propias. |
| **v1: propuesta para un piloto confiable** | Mejoras al compositor por categorías; feedback con motivos; deshacer y editar usos; reducir fricción al cargar varias prendas; ciudad y pronóstico real con fecha/hora y alternativa manual; sensibilidad al frío/calor; mejores sugerencias; exportación/respaldo; privacidad y eliminación documentadas. Sincronización/cuenta solo si el piloto la necesita. | Hay uso repetido y entendemos dónde mejoran las sugerencias frente al armado manual. |
| **Después, según evidencia** | Referencias visuales traducidas a prendas propias, análisis de imágenes, eliminación de fondo, viajes, sincronización avanzada, compras, Shopify y afiliados. | Cada incorporación resuelve una necesidad observada y tiene un costo sostenible. |

No incluir en v0: chat de estilista, modelos generativos, probador virtual, red social, catálogo de tiendas, pagos, geolocalización continua o un calendario completo. Esta frontera permite aprender cámara, permisos, navegación, estado y persistencia de React Native sin depender de un backend o proveedor de IA.

**Estado de entrega:** existe un prototipo local con composición por categorías y QA web. El [README](../README.md) y la [evaluación](evaluacion.md) enumeran lo entregado, lo probado y lo pendiente; este documento conserva hipótesis de producto. Intercambiar prendas no equivale a un compositor libre; guardar o confirmar uso no equivale a feedback detallado ni a deshacer.

La estación del año es una pista secundaria: no sustituye temperatura, lluvia, lugar interior/exterior o preferencia personal. En v0 el clima es declarado manualmente y debe verse así; no simular un pronóstico real.

## Evitar que el registro sea el producto

Como propuesta para reducir esfuerzo, evaluar categoría y color al inicio y completar detalles después. La implementación actual requiere nombre, al menos un color y una ocasión; admite varios colores por prenda. Hacer opcional el nombre es una posibilidad por validar. La compatibilidad térmica y formalidad pueden empezar con opciones simples editables, sin pedir material, talla, marca, precio o medidas corporales para empezar.

Mostrar progreso por capacidad: «Ya puedes armar un conjunto» o «Agrega calzado». Ofrecer saltar preferencias y usar datos de ejemplo solo como demo. No prometer combinaciones variadas si faltan prendas. Eliminar fondo puede mejorar la presentación, pero una foto reconocible debe ser suficiente para evaluar utilidad.

## Disponibilidad, rotación y aprendizaje

- **Disponible:** la persona puede usar la prenda ahora. «No disponible» la excluye de las sugerencias hasta que la reactive; un motivo como lavado es opcional. Archivar significa que ya no participa en el clóset activo. No inferir que una pieza está sucia por haberla usado.
- **Guardado** expresa intención o gusto. **Usado** es un evento confirmado con fecha local y las piezas del conjunto. Solo el segundo actualiza la rotación. Se propone corregirlo o deshacerlo en una siguiente iteración; si el prototipo no lo permite, declarar esa limitación.
- **Rotación** es preferencia por variar, no prohibición de repetir. Se priorizan piezas menos recientes, manteniendo clima, disponibilidad y restricciones explícitas. Calzado y abrigo pueden repetirse. «Quiero repetir este conjunto» debe funcionar.
- **Feedback propuesto para v1:** «Me gusta» / «Cambiaría algo», con motivos opcionales: combinación, demasiado formal, frío/calor, no es mi estilo o prenda no disponible. Rechazar un conjunto no significa odiar todos sus colores ni sus prendas. El prototipo puede comenzar únicamente con guardar y confirmar uso.

Antes de recomendar se aplican restricciones explícitas; después se ordenan candidatos por preferencias, contexto y uso reciente. Las reglas iniciales pueden ser simples y visibles. No llamar «IA» a un generador de reglas ni afirmar que conoce el estilo antes de tener señales.

## Personalización inclusiva

Preguntar qué desea usar: colores preferidos y colores a evitar, cortes o siluetas si le interesan, comodidad, formalidad y sensibilidad térmica. No pedir género para habilitar categorías o recomendaciones. Usar las mismas categorías y herramientas para todas las personas, con etiquetas editables y sin juicios sobre cuerpo, edad o lo que «debería» favorecerles.

Los colores a evitar son una preferencia editable. Una pieza propia no debe desaparecer sin explicación: indicar el filtro aplicado y permitir retirarlo. La persona conserva el control al mezclar manualmente.

## Qué ya existe

Revisión de documentación oficial el **23/10/2026**; no se instalaron ni probaron estas apps. Las fuentes describen sus capacidades, no demuestran calidad o satisfacción.

| Producto | Solapamiento confirmado | Qué implica para esta idea |
|---|---|---|
| [Whering: sugerencias](https://whering.co.uk/faq/outfit-suggestions-on-Whering) | W Pick propone conjuntos diarios con ropa del clóset, estilo personal y pronóstico. | «Tu ropa + estilo + clima» ya existe; no es diferenciación suficiente. |
| [Acloset: FAQ](https://www.acloset.app/support/) | Recomienda con clóset, clima y ocasión; permite partir de piezas elegidas y completar categorías. Advierte que hacen falta suficientes prendas y atributos adecuados. | Tanto el armado parcial como la fricción de inventariar son problemas relevantes que debemos evaluar. |
| [Stylebook: funciones](https://www.stylebookapp.com/features.html) | Composición manual, Outfit Shuffle, calendario de uso y estados como lavado o préstamo. | Mezclar, registrar uso y disponibilidad tampoco son novedades por sí solas. |

**Diferenciación a comprobar:** una experiencia en español, breve y controlable, que entregue valor con pocas prendas y permita entender y corregir una sugerencia. No hay evidencia todavía de que estos competidores fallen ahí. Tampoco se investigó exhaustivamente el mercado, precios, políticas de datos ni condiciones de afiliación.

## Piloto y criterio de decisión

Probar con **5–8 personas durante siete días**, incluyendo diferentes expresiones de estilo, plantillas de conjunto y al menos dos contextos térmicos. Reclutar por el problema de decidir qué ponerse, no por afinidad con la idea. Nadie ha sido contactado.

Medir primero una sesión de alta sin ayuda, con ropa propia, y después el uso cotidiano. Registrar localmente o en una hoja de observación: tiempo de alta, abandono, tiempo hasta elegir, origen del conjunto (sugerido, ajustado o manual), uso confirmado y motivo de rechazo. No enviar fotos a analítica.

**Métrica principal:** proporción de participantes que confirma haber usado un conjunto sugerido o ajustado en al menos tres días del piloto. Acompañarla con el número de conjuntos completamente manuales para saber qué parte del valor proviene del recomendador.

**Umbrales provisionales, no benchmarks:** al menos 5 de 8 completan el alta y obtienen una opción útil sin ayuda en ocho minutos; al menos 4 de 8 usan sugerencias o ajustes en tres días; la mayoría de elecciones ocurre en menos de dos minutos. Si participan cinco personas, reportar conteos y observaciones, sin convertir estos umbrales en significancia estadística.

Si el alta bloquea, reducir carga antes de añadir inteligencia. Si vuelven solo para armar manualmente, explorar un planificador. Si usan y repiten el flujo, entrevistar sobre pago y probar una oferta concreta antes de construir cobros. Afiliados pueden introducir conflicto con «aprovecha lo que tienes» y requieren una decisión explícita posterior.

## Preguntas abiertas

- ¿Cuánto esfuerzo de fotografiar prendas acepta realmente una persona antes del primer beneficio?
- ¿Busca ahorrar tiempo, variar, verse mejor según su propio criterio o registrar lo que usa? ¿Cuál domina?
- ¿Cuántas prendas hacen falta para un resultado útil en distintos tipos de clóset?
- ¿Qué explica los rechazos: datos incorrectos, contexto incompleto, gusto o mala combinación?
- ¿El uso se sostiene después de la novedad inicial y existe disposición a pagar? ¿Por qué sería recurrente?
- Tras aprender con el prototipo, ¿qué señales justificarían invertir en validación comercial, backend o automatización?

## Copy y comprobaciones candidatas

Esta tabla conserva ejemplos del planteamiento inicial. No es el catálogo de textos vigente: el copy se simplificó en la revisión visual. La columna de revisión distingue el núcleo propuesto de las evoluciones posteriores; la evidencia está en el README y la evaluación.

| Flujo | Copy orientativo | Comprobación | Revisión |
|---|---|---|---|
| Contexto | «Clima elegido por ti» | Cambiar frío/templado/calor afecta las opciones; no aparece como información en vivo. | Núcleo v0; verificar entrega. |
| Clóset incompleto | «Agrega calzado para completar tu conjunto» | Identifica lo que falta y permite agregar, sin generar una pieza ficticia. | Núcleo v0; verificar entrega. |
| Sugerencia | «Con tu ropa» · «Cambia una prenda» | Todas las piezas pertenecen al clóset y están disponibles. Un cambio preserva el resto cuando existe una alternativa válida. | Núcleo v0; verificar entrega. |
| Uso | «Lo usé» | Guardar no suma usos; confirmar sí. | Núcleo v0; verificar entrega. |
| Disponibilidad | «Disponible» · «No disponible por ahora» | Una pieza excluida deja de aparecer en nuevas sugerencias y puede reactivarse. | Núcleo v0; verificar entrega. |
| Persistencia | «Guardado en este dispositivo» | Al cerrar y abrir se conservan prendas, preferencias y usos; no se promete respaldo en una cuenta. | Núcleo v0; verificar entrega. |
| Corregir uso | «Deshacer registro» | Corrige el historial y la rotación. | Propuesta v1. |
| Feedback detallado | «Prefiero otra combinación» | Permite explicar el rechazo sin vetar definitivamente cada prenda. | Propuesta v1. |
| Compositor libre | «Arma tu combinación» | Permite elegir cada pieza sin partir de una sugerencia. | Propuesta v1. |

Estos son criterios para revisar contra lo entregado. Si alguno queda pendiente, declararlo junto con la limitación técnica; no presentarlo como verificado solo porque figura aquí.

## Cómo evaluar esta propuesta

El prototipo debe demostrar el circuito **prendas propias → contexto → elegir/ajustar → uso confirmado → próxima sugerencia**, con datos que sobrevivan al reinicio. Una interfaz atractiva o conjuntos de demostración no validan ese circuito. Evaluar por separado aprendizaje técnico, funcionamiento del prototipo, utilidad observada y viabilidad comercial.
