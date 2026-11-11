import type {
  Category,
  ColorTone,
  MissingPiece,
  Occasion,
  RecommendationProblem,
  StyleId,
  SwapProblem,
} from '../domain/types';

const MISSING: Record<MissingPiece, string> = {
  shoes: 'calzado',
  top: 'una parte de arriba',
  bottom: 'una parte de abajo',
};

function missingBase(missing: MissingPiece[], onePieceWouldDo: boolean) {
  if (!onePieceWouldDo) return MISSING.shoes;
  if (missing.includes('top') && missing.includes('bottom'))
    return 'una parte de arriba y una de abajo, o una prenda completa';
  return `${MISSING[missing.includes('top') ? 'top' : 'bottom']} o una prenda completa`;
}

/**
 * Spanish, the source catalog: every other language has this same shape. Text follows the tone
 * guide in docs/diseno-personalizacion.md; functions receive what changes in a sentence.
 */
export const es = {
  common: {
    appName: 'Arma tu outfit',
    retry: 'Intentar de nuevo',
    retryShort: 'Reintentar',
    tapToClose: 'Toca para cerrar',
    optional: 'opcional',
    save: 'Guardar',
    back: 'Atrás',
    close: 'Cerrar',
    comingSoon: 'Ya casi…',
  },
  /** "a, b y c". */
  list: (items: string[]) =>
    items.length > 1
      ? `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
      : (items[0] ?? ''),
  categories: {
    top: 'Parte de arriba',
    bottom: 'Parte de abajo',
    'one-piece': 'Prenda completa',
    shoes: 'Calzado',
    layer: 'Capa exterior',
    accessory: 'Accesorio',
  } satisfies Record<Category, string> as Record<Category, string>,
  occasions: {
    casual: 'Día a día',
    work: 'Trabajo',
    formal: 'Evento formal',
    sport: 'Actividad física',
    outing: 'Salida',
  } satisfies Record<Occasion, string> as Record<Occasion, string>,
  styles: {
    minimal: {
      label: 'Minimal',
      description: 'Líneas simples y combinaciones discretas.',
    },
    classic: {
      label: 'Clásico',
      description: 'Prendas de siempre y detalles sobrios.',
    },
    street: {
      label: 'Urbano',
      description: 'Inspiración de calle y contrastes casuales.',
    },
    relaxed: {
      label: 'Relajado',
      description: 'Comodidad y un aire despreocupado.',
    },
    creative: {
      label: 'Creativo',
      description: 'Colores, mezclas y detalles con personalidad.',
    },
    sport: {
      label: 'Deportivo',
      description: 'Prendas con inspiración deportiva.',
    },
    girly: {
      label: 'Girly',
      description: 'Tonos suaves, moños y detalles juguetones.',
    },
    feminine: {
      label: 'Femenino',
      description: 'Siluetas definidas y detalles delicados.',
    },
  } as Record<StyleId, { label: string; description: string }>,
  /** Keyed by the stored color id, which stays in Spanish. */
  colors: {
    negro: 'Negro',
    blanco: 'Blanco',
    gris: 'Gris',
    beige: 'Beige',
    azul: 'Azul',
    verde: 'Verde',
    cafe: 'Café',
    rojo: 'Rojo',
    rosa: 'Rosa',
    amarillo: 'Amarillo',
    morado: 'Morado',
    naranja: 'Naranja',
  },
  /** In the garments' voice; they reword a reason and never add a claim. */
  reasons: {
    style: (styles: string) => `Hoy vamos en plan ${styles}.`,
    lightlyUsed: 'Traemos prendas que casi no usas.',
    occasion: {
      casual: 'Vamos bien para tu día a día.',
      work: 'Vamos bien para el trabajo.',
      formal: 'Vamos bien para un evento formal.',
      sport: 'Vamos bien para moverte.',
      outing: 'Vamos bien para salir.',
    } as Record<Occasion, string>,
    warmth: (degrees: number) => `Calculamos el abrigo para ${degrees} °C.`,
    favoriteColor: 'Llevamos un color que te gusta.',
    rotation: (days: number) => `Llevamos ${days} días sin uso registrado.`,
    rainReady: 'Calzado y capa van marcados para lluvia.',
    oneColor: 'Vamos en un solo color.',
  },
  warnings: {
    occasionUntagged: 'Hay prendas sin etiqueta para esta ocasión',
    warmth: (degrees: number) => `Revisa el abrigo para ${degrees} °C`,
    wornRecently: 'Incluye prendas usadas recientemente',
    shoesNotRainReady: 'Calzado sin marcar para lluvia',
    noRainLayer: 'Sin capa marcada para lluvia',
  },
  problems: {
    recommendation: (problem: RecommendationProblem): string => {
      switch (problem.kind) {
        case 'empty':
          return 'Tu clóset está vacío. Agrega tu primera prenda.';
        case 'pinned-gone':
          return 'La prenda ya no está en tu clóset.';
        case 'pinned-unavailable':
          return 'Marca esta prenda como disponible para combinarla.';
        case 'pinned-excluded':
          return 'Esta prenda tiene un color excluido. Puedes cambiarlo en tus preferencias.';
        case 'pinned-missing':
          return `Para combinar esta prenda, agrega ${problem.missing.map((piece) => MISSING[piece]).join(' y ')} o revisa la disponibilidad y los colores excluidos.`;
        case 'missing':
          return `Falta ${missingBase(problem.missing, problem.onePieceWouldDo)} disponible que respete tus colores excluidos. Agrega prendas o revisa disponibilidad y preferencias.`;
      }
    },
    swap: (problem: SwapProblem | undefined, category: Category): string => {
      switch (problem) {
        case 'outfit-changed':
          return 'La combinación cambió o contiene prendas no disponibles. Genera opciones nuevas.';
        case 'slot-missing':
          return 'Esta combinación no tiene ese tipo de prenda para cambiar.';
        case 'no-option':
          return `No hay otra opción disponible de ${es.categories[category].toLowerCase()} que respete tus preferencias.`;
        default:
          return '';
      }
    },
  },
  /** Names given to the example garments when they are added. */
  demoNames: {
    'demo2-tee-white': 'Playera blanca',
    'demo2-tee-gray': 'Playera gris',
    'demo2-shirt-denim': 'Camisa de mezclilla',
    'demo2-sweater-navy': 'Suéter azul marino',
    'demo2-top-black': 'Top negro',
    'demo2-jacket-denim': 'Chamarra de mezclilla',
    'demo2-jeans-blue': 'Jeans azules',
    'demo2-dress-white': 'Vestido blanco',
    'demo2-shoes-red': 'Zapatos rojos',
    'demo2-boots-brown': 'Botines café',
  } as Record<string, string>,
  storage: {
    loadFailed:
      'No pudimos abrir tus datos locales. No los reemplazamos. Intenta de nuevo; si persiste, conserva los datos del navegador o la app para poder recuperarlos.',
    saveFailedBecause: (reason: string) =>
      `${reason} Los últimos cambios siguen en esta pantalla. Reintenta antes de cerrarla.`,
    saveFailed:
      'No se guardaron los últimos cambios. Revisa el espacio disponible y vuelve a intentar. Mantén esta pantalla abierta.',
    errors: {
      incompatible:
        'El formato guardado no es compatible. Tus datos no se reemplazaron.',
      incomplete: 'No se guardó el cambio porque contiene datos incompletos.',
      'web-limit':
        'Se alcanzó el límite de fotos de la vista web. Reduce o quita una foto y vuelve a guardar. Los datos guardados anteriormente se conservan.',
    },
  },
  today: {
    title: 'Hoy',
    aiChosen: 'Propuesta principal elegida con IA.',
    aiPending: 'Consultando…',
    aiChoose: 'Elegir con IA',
    aiFailed: 'No se pudo consultar la IA.',
    emptyTitle: 'Todavía no hay outfits',
    noMoreIdeas: 'Ya no tengo más ideas para hoy.',
    goToCloset: 'Ir a mi clóset',
    showPrevious: 'Ver las anteriores',
    reviewStyle: 'Revisar mi estilo',
  },
  closet: {
    all: 'Todo',
    edit: (name: string) => `Editar ${name}`,
    emptyCategory: 'No tienes prendas en esta categoría.',
    title: 'Mi clóset',
    count: (total: number, available: number) =>
      `${total} ${total === 1 ? 'prenda' : 'prendas'} · ${available} ${available === 1 ? 'disponible' : 'disponibles'}`,
    addShort: '+ Agregar prenda',
    add: 'Agregar prenda',
    build: 'Armar outfit',
    emptyHint:
      'Para un outfit necesitas una parte de arriba, una de abajo y calzado; o una prenda completa y calzado.',
    showDemo: 'Ver el clóset de ejemplo',
  },
  style: {
    title: 'Mi estilo',
    colors: 'Colores',
  },
  combine: {
    title: 'Combínala',
    stays: (name: string) => `${name} se queda.`,
  },
  settings: {
    title: 'Ajustes',
    theme: 'Tema',
    language: 'Idioma',
    languageAuto: 'Automático',
    rotation: 'Esperar para repetir una prenda',
    days: (days: number) => `${days} días`,
    noWait: 'Nada',
    personalize: 'Volver a personalizar',
    dataTitle: 'Tus datos',
    dataPrivacy:
      'Tu ropa y tus fotos se guardan solo en este dispositivo, sin copia en la nube. Si borras la app, se pierden. Solo Analizar foto envía la foto de una prenda a OpenAI.',
    dataCounts: (own: number, worn: number) =>
      `${own} ${own === 1 ? 'prenda propia' : 'prendas propias'} · ${worn} ${worn === 1 ? 'uso registrado' : 'usos registrados'}`,
    weatherCredit: 'Clima automático: datos de Open-Meteo',
  },
  notices: {
    goalSaved: 'Guardé tu objetivo.',
    stylesSaved: 'Guardé tus estilos.',
    itemSaved: 'Listo, quedó guardada.',
    allSet: (name: string) => (name ? `Todo listo, ${name}.` : 'Todo listo.'),
    unsaved: 'Lo quité de guardados.',
    outfitSaved: 'Outfit guardado.',
    wearFailed:
      'No se pudo registrar: revisa la fecha y que las prendas sigan disponibles.',
    alreadyWorn: 'Ya lo registraste hoy.',
    worn: 'Anotado: te lo pusiste hoy.',
    demoReady: 'Listo, este es el clóset de ejemplo.',
    swapped: 'Prenda cambiada con una opción de tu guardarropa.',
  },
  appearance: {
    layout: 'Vista',
    wide: 'Amplia',
    compact: 'Compacta',
    reasons: 'Explicaciones',
    warningsStay: 'Las advertencias siguen visibles.',
    reasonsToggle: 'Mostrar explicaciones de conjuntos',
    haptics: 'Vibración',
    themeLabel: (name: string) => `Tema ${name}`,
  },
  themes: {
    linen: 'Lino',
    paper: 'Papel',
    midnight: 'Medianoche',
    sage: 'Salvia',
    bubblegum: 'Chicle',
    mauve: 'Malva',
  },
  demo: {
    banner: 'CLÓSET DE EJEMPLO',
    useMine: 'Usar mi ropa',
  },
  outfit: {
    save: 'Guardar outfit',
    unsave: 'Quitar outfit de guardados',
    wore: 'Hoy me lo puse',
    another: 'Prefiero otro',
    title: 'Tu outfit',
    savedNote: 'Guardado tal como estaba; no considera el clima de hoy.',
    page: (page: number, total: number) => `Idea ${page} de ${total}`,
    pageCount: (page: number, total: number) => `${page} de ${total}`,
  },
  swap: {
    title: (category: string) => `Cambiar · ${category}`,
    insteadOf: (name: string) => `En lugar de ${name}.`,
    swapFor: (name: string) => `Cambiar por ${name}`,
    none: (excludedColors: boolean) =>
      `No hay otra disponible${excludedColors ? ' sin los colores que evitas' : ''}. Agrega una en Mi clóset.`,
  },
  art: {
    photo: 'Foto',
    demoPhoto: 'Foto de ejemplo',
    drawing: 'Ilustración genérica',
    laundry: 'Lavandería',
    inLaundrySuffix: ', en lavandería',
    colorsSuffix: (colors: string) => `. Colores: ${colors}`,
    ofName: (name: string) => ` de ${name}`,
    pinned: (name: string) => `${name}, prenda elegida`,
    change: (name: string) => `Cambiar ${name}`,
  },
  wearMore: {
    eyebrow: 'Otra vuelta',
    label: (name: string) => `Otra vuelta: ver ideas con ${name}`,
  },
  weather: {
    automatic: 'Automático',
    manual: 'Manual',
    manualShort: 'manual',
    pillLabel: (degrees: number, automatic: boolean, occasion: string) =>
      `Editar clima y ocasión. ${degrees} grados${automatic ? '' : ', clima manual'}, ${occasion}`,
    loading: 'Consultando el clima. Mientras, se usa el manual.',
    usingManual: (error: string) =>
      `${error || 'Sin clima reciente.'} Se usa el clima manual.`,
    refreshLabel: 'Actualizar clima',
    refresh: 'Actualizar',
    errors: {
      network: 'No se pudo conectar con el servicio de clima.',
      http: 'El servicio de clima no está disponible.',
      invalid: 'El servicio devolvió datos de clima incompletos.',
      timeout: 'El clima tardó demasiado. Vuelve a intentar.',
      aborted: 'Consulta cancelada.',
    },
  },
  context: {
    title: 'Clima y ocasión',
    apply: 'Aplicar',
    chooseCity: 'Elige una ciudad para el clima automático.',
    occasion: 'Ocasión',
    weather: 'Clima',
    changeCity: 'Cambiar de ciudad',
    change: 'Cambiar',
    backup: (degrees: number, raining: boolean) =>
      `Sin dato reciente se usa el clima manual: ${degrees}°, ${raining ? 'con lluvia' : 'sin lluvia'}.`,
    changeBackup: 'Cambiar el clima manual de respaldo',
    backupTitle: 'Clima manual, para cuando no hay dato reciente',
  },
  city: {
    selected: 'Seleccionada:',
    locating: 'Buscando tu ciudad…',
    updateWithLocation: 'Actualizar con mi ubicación',
    useLocation: 'Usar mi ubicación',
    locationPrivacy:
      'Solo para encontrar tu ciudad. No guardamos tu ubicación exacta.',
    denied: 'Sin permiso de ubicación. Busca tu ciudad por nombre.',
    blocked:
      'La ubicación está bloqueada para esta app. Actívala en Ajustes o busca tu ciudad.',
    openSettings: 'Abrir Ajustes',
    openSettingsFailed: 'Abre Ajustes y activa Ubicación para esta app.',
    searchByName: 'Buscar por nombre',
    search: 'Buscar ciudad',
    placeholder: 'Nombre de la ciudad',
    searching: 'Buscando…',
    notFound: 'No encontramos esa ciudad. Prueba otro nombre.',
    searchFailed: 'No pudimos buscar la ciudad.',
    failures: {
      'services-off':
        'La ubicación del dispositivo está desactivada. Actívala o busca tu ciudad por nombre.',
      position: 'No pudimos obtener tu ubicación. Busca tu ciudad por nombre.',
      'not-found': 'No pudimos identificar tu ciudad. Búscala por nombre.',
      network: 'No se pudo conectar con el servicio de clima.',
      http: 'El servicio de clima no está disponible.',
      invalid: 'Escribe una ciudad de hasta 120 caracteres.',
      timeout: 'El clima tardó demasiado. Vuelve a intentar.',
      aborted: 'Consulta cancelada.',
    },
  },
  manualWeather: {
    temperature: 'Temperatura',
    lower: 'Bajar la temperatura',
    raise: 'Subir la temperatura',
    degrees: (degrees: number) => `${degrees} grados Celsius`,
    rain: 'Lluvia',
    raining: 'Hay lluvia',
  },
  itemForm: {
    colorsRequired: 'Elige al menos un color.',
    occasionsRequired: 'Elige al menos una ocasión.',
    /** Neutral wording avoids gender agreement with the category. */
    suggestedName: (category: string, colors: string[], more: boolean) =>
      `${category} · ${colors.join(' y ')}${more ? ' y más' : ''}`,
  },
  itemEditor: {
    editTitle: 'Editar prenda',
    saveChanges: 'Guardar cambios',
    noOccasion: 'Sin ocasión',
    warmth: ['Muy ligera', 'Ligera', 'Abrigadora', 'Muy abrigadora'],
    forRain: 'Para lluvia',
    styleCount: (count: number) =>
      `${count} ${count === 1 ? 'estilo' : 'estilos'}`,
    moreDetails: 'Más detalles',
    usedFor: '¿Para qué la usas?',
    warmthTitle: 'Qué tanto abriga',
    rainUse: 'La uso cuando llueve',
    rainReady: 'Apta para lluvia',
    stylesTitle: 'Estilos · opcional',
    upToThree: 'Hasta 3.',
    tooManyStyles: 'Elige hasta tres estilos. Quita uno para probar otro.',
    discardQuestion: '¿Descartar cambios?',
    keepEditing: 'Seguir editando',
    discard: 'Descartar cambios',
    nameTitle: 'Nombre · opcional',
    nameLabel: 'Nombre de la prenda, opcional',
    nameHint: (suggested: string) =>
      `Si lo dejas vacío se llamará ${suggested}`,
    namePlaceholder: 'Ej. La camisa de las bodas',
    available: 'Disponible para usar',
    availableHint: 'Desactívala si está en la lavandería.',
    wearMore: 'Quiero usarla más',
    whatIsIt: '¿Qué es?',
    whichColor: '¿De qué color?',
  },
  photo: {
    saving: 'Guardando foto…',
    choose: 'Elegir foto',
    take: 'Tomar foto',
    openSettingsFailed: 'Abre Ajustes y activa Cámara para esta app.',
    remove: 'Quitar foto',
    keepBackground: 'Usar la foto con fondo',
    cutting: 'Quitando fondo…',
    cut: 'Quitar fondo',
    cutLocal: 'Se hace en este teléfono; la foto no se envía.',
    analyzing: 'Analizando…',
    retryAnalysis: 'Reintentar análisis',
    analyzeAgain: 'Analizar de nuevo',
    analyze: 'Analizar foto',
    analyzeWithAi: 'Analizar foto con IA',
    analysisPrivacy:
      'Se enviará esta foto a OpenAI para proponer nombre, categoría y colores.',
    cancelAnalysis: 'Cancelar análisis',
    cameraDenied: 'Permite la cámara para tomar una foto.',
    cameraBlocked:
      'La cámara está bloqueada. Actívala en Ajustes o elige una foto.',
    saveFailed:
      'No pudimos guardar la foto. Revisa el permiso o usa una imagen más pequeña; también puedes continuar sin foto.',
    cutoutFailed: 'No pudimos quitar el fondo. Puedes usar la foto original.',
    analysisFailed:
      'No pudimos analizar la foto. Puedes completar los datos manualmente.',
    applied: 'Datos aplicados. Revisa los demás campos y guarda la prenda.',
    rejections: {
      multiple_garments:
        'Hay varias prendas en la foto. Usa una foto de una sola prenda.',
      unclear:
        'No se distingue una sola prenda con claridad. Prueba otra foto o completa los datos a mano.',
      not_garment:
        'No identificamos una prenda en la foto. Elige otra foto o completa los datos a mano.',
    },
    aiErrors: {
      configuration:
        'El análisis no está configurado. Puedes completar la prenda manualmente.',
      image: 'Usa una foto JPEG, PNG o WebP de hasta 4 MiB.',
      network:
        'No pudimos conectar con el análisis. Puedes reintentar o completar la prenda manualmente.',
      timeout:
        'El análisis tardó demasiado. Puedes reintentar o completar la prenda manualmente.',
      aborted: 'Análisis cancelado.',
      response:
        'El análisis devolvió datos incompletos. No cambiamos tu formulario.',
      server:
        'No pudimos analizar la foto. Puedes reintentar o completar la prenda manualmente.',
    },
  },
  suggestionReview: {
    title: 'Revisar análisis',
    hint: 'Corrige lo que haga falta antes de aplicarlo.',
    name: 'Nombre propuesto',
    nameLabel: 'Nombre propuesto por el análisis',
    category: 'Categoría propuesta',
    colors: 'Colores propuestos',
    apply: 'Aplicar estos datos',
    nameRequired: 'Escribe un nombre.',
    invalid: 'Revisa el nombre, la categoría y los colores.',
    dismiss: 'Descartar análisis',
  },
  builder: {
    missing: (pieces: string) => `Falta elegir ${pieces}.`,
    separates: 'Arriba + abajo',
    stage: (names: string) => `Tu outfit: ${names}.`,
    empty: 'Tu outfit, vacío.',
    stageMissing: (pieces: string) => `Falta: ${pieces}.`,
    noneAvailable: 'Aún no hay prendas disponibles en esta categoría.',
  },
  colorPicker: {
    favorite: 'Me gustan',
    avoid: 'Prefiero evitar',
    favoriteHint: 'Los uso primero en tus outfits.',
    avoidHint: 'No te propongo prendas con estos colores.',
    tileLabel: (
      name: string,
      selected: boolean,
      inOther: boolean,
      mode: 'favorite' | 'avoid',
    ) =>
      `${name}${selected ? ', seleccionado' : ''}${inOther ? `, actualmente ${mode === 'favorite' ? 'evitado' : 'favorito'}` : ''}`,
    youAvoid: 'Lo evitas',
    youLike: 'Te gusta',
  },
  saved: {
    title: 'Guardados',
    open: (names: string) => `Ver outfit guardado: ${names}`,
    byYou: 'Creado por ti',
    saved: 'Guardado',
    items: (count: number) => `${count} prendas`,
    empty: 'Todavía no guardas ningún outfit. Toca ♡ en Hoy para guardar uno.',
  },
  styleBoard: {
    current: 'Así me visto',
    currentEmpty: 'Elige tus estilos',
    goal: 'Quiero probar',
    goalEmpty: 'Elige cómo quieres verte',
    edit: 'Editar',
    choose: 'Elegir',
    full: 'Máximo 3. Quita uno para elegir otro.',
    stylePrefix: 'Estilo',
  },
  explore: {
    label: 'Hoy me animo a algo nuevo',
    toggle: 'Algo nuevo',
    gaps: (pieces: string) =>
      `Para ese look te falta: ${pieces}. Etiqueta tus prendas o agrega alguna.`,
  },
  styleGoal: {
    colorTest: 'Colorimetría',
    title: 'Cambiar mi estilo',
    wantMore: 'Me gustaría verme más…',
    toneTitle: 'Tu colorimetría · opcional',
    testHint: 'Compara colores junto a tu cara. Tu foto no sale del teléfono.',
    repeatTest: 'Repetir la prueba',
    takeTest: 'Hacer la prueba',
    removeResult: 'Quitar resultado',
    yourColors: 'Tus colores',
    yourColorsHint: 'Los que elijas se suman a tus favoritos.',
  },
  colorTest: {
    introSay: 'Soy Bufi, la bufanda. Comparemos colores junto a tu cara.',
    introTitle: 'Tu colorimetría',
    steps: (count: number) => `Son ${count} comparaciones rápidas.`,
    tips: [
      'Luz natural, de frente a una ventana.',
      'Sin filtros y con poco maquillaje.',
      'Acércate: que tu cara llene la foto, con el cabello hacia atrás.',
    ],
    privacy: 'Tu foto no sale del teléfono y no se guarda.',
    takeSelfie: 'Tomar selfie',
    choosePhoto: 'Elegir una foto',
    resultSay: 'Según lo que elegiste, eres…',
    lowConfidence: 'Salió muy parejo. Si puedes, repítela con mejor luz.',
    simulation: 'Es una simulación: depende de la luz, la foto y tu pantalla.',
    useColors: 'Usar mis colores',
    rounds: [
      'Primero, la temperatura',
      'Ahora, la intensidad',
      'Último ajuste',
    ],
    question: '¿Con cuál se ve tu piel más uniforme?',
    questionHint: 'Fíjate en ojeras, sombras y rojeces. Toca tu favorita.',
    left: 'izquierda',
    right: 'derecha',
    chooseSide: (side: string, name: string) => `Elegir ${side}: ${name}`,
    tie: 'No noto diferencia',
    cameraDenied: 'Permite la cámara para tomar tu selfie.',
    photoFailed: 'No pudimos abrir esa foto. Prueba con otra.',
  },
  tones: {
    'spring-light': {
      label: 'Primavera clara',
      description: 'Colores cálidos, luminosos y suaves.',
    },
    'spring-bright': {
      label: 'Primavera brillante',
      description: 'Colores cálidos, vivos y alegres.',
    },
    'summer-light': {
      label: 'Verano claro',
      description: 'Colores fríos, claros y delicados.',
    },
    'summer-mute': {
      label: 'Verano suave',
      description: 'Colores fríos, grisáceos y serenos.',
    },
    'autumn-mute': {
      label: 'Otoño suave',
      description: 'Colores cálidos, terrosos y apagados.',
    },
    'autumn-deep': {
      label: 'Otoño profundo',
      description: 'Colores cálidos, intensos y oscuros.',
    },
    'winter-bright': {
      label: 'Invierno brillante',
      description: 'Colores fríos, puros y de alto contraste.',
    },
    'winter-deep': {
      label: 'Invierno profundo',
      description: 'Colores fríos, oscuros y elegantes.',
    },
  } as Record<ColorTone, { label: string; description: string }>,
  drapes: {
    coral: 'Coral',
    fuchsia: 'Fucsia',
    gold: 'Dorado',
    silver: 'Plateado',
    olive: 'Oliva',
    teal: 'Azul verdoso',
    peach: 'Durazno',
    terracotta: 'Terracota',
    'apple-green': 'Verde manzana',
    moss: 'Musgo',
    turquoise: 'Turquesa',
    petrol: 'Petróleo',
    lavender: 'Lavanda',
    violet: 'Violeta',
    'dusty-pink': 'Rosa empolvado',
    magenta: 'Magenta',
    'gray-blue': 'Azul grisáceo',
    'royal-blue': 'Azul rey',
    apricot: 'Melocotón',
    'bright-orange': 'Naranja vivo',
    'soft-green': 'Verde tierno',
    'bright-green': 'Verde vivo',
    vanilla: 'Vainilla',
    'bright-yellow': 'Amarillo vivo',
    'light-lilac': 'Lila claro',
    'gray-mauve': 'Malva gris',
    'pale-blue': 'Azul pálido',
    'smoke-blue': 'Azul humo',
    'pale-pink': 'Rosa pálido',
    'old-rose': 'Rosa viejo',
    camel: 'Camel',
    chocolate: 'Chocolate',
    sage: 'Salvia',
    'forest-green': 'Verde bosque',
    'soft-tile': 'Teja suave',
    'burnt-wine': 'Vino tostado',
    'bright-fuchsia': 'Fucsia vivo',
    'cool-wine': 'Vino frío',
    'electric-blue': 'Azul eléctrico',
    navy: 'Marino',
    emerald: 'Esmeralda',
    pine: 'Pino',
  },
  onboarding: {
    outfitSay: 'Soy Teni, los tenis. Con lo que me contaste armé esto.',
    outfitTitle: 'Tu primer outfit',
    occasionQuestion: '¿Para qué te vistes casi siempre?',
    done: '¡Listo!',
    startWith: '¿Con qué ropa empezamos?',
    ownClothes: 'Vamos con mi ropa',
    colorsSay: 'Yo soy Chama, la chamarra. Vamos con los colores.',
    colorsTitle: '¿Qué colores te gustan?',
    crewHello: '¡Hola! Soy Tere.',
    noPreview: 'Con esos gustos no me salió nada. Ajústalos cuando quieras.',
    exampleOutfit: 'Outfit de ejemplo con prendas ficticias',
    exampleTag: 'Ejemplo con prendas ficticias',
    helloSay: (name: string) =>
      name ? `Mucho gusto, ${name}. Soy Tere.` : '¡Hola! Soy Tere, tu playera.',
    nameTitle: '¿Cómo te llamas?',
    nameLabel: 'Tu nombre, opcional',
    namePlaceholder: 'Tu nombre · opcional',
    struggleQuestion: '¿Qué se te complica al vestirte?',
    struggles: {
      decide: {
        label: 'Me tardo mucho en decidir',
        reply: 'De eso me encargo: cada día te propongo hasta tres outfits.',
      },
      colors: {
        label: 'Me cuesta combinar colores',
        reply: 'En un momento me dices cuáles te gustan y cuáles evitar.',
      },
      weather: {
        label: 'Nunca le atino al clima',
        reply: 'Dime tu ciudad y ajusto el abrigo al clima de hoy.',
      },
      style: {
        label: 'Quiero cambiar de estilo',
        reply: 'Cuéntame cómo quieres verte y armamos hacia allá.',
      },
    },
    cityTitle: 'Tu ciudad · opcional',
    closeLabel: 'Cerrar personalización',
    stepLabel: (step: number, total: number) => `Paso ${step} de ${total}`,
    later: 'Lo hago después',
    next: ['Seguimos', 'Ahora los colores', 'Ver mi outfit'],
    styleSay: (name: string) =>
      `${name ? `${name}, soy` : 'Soy'} Cami, la camisa. Cuéntame de tu ropa.`,
    styleTitle: '¿Cómo te vistes casi siempre?',
    goalQuestion: '¿Y cómo te gustaría verte?',
    styleHint: 'Hasta 3 en cada grupo · Opcional',
    welcome:
      'Tere, Cami y compañía te ayudan a elegir qué ponerte con la ropa que ya tienes.',
    welcomeStart: 'Vamos a tu clóset',
    welcomePrivacy: 'Sin cuenta. Tus datos se quedan en tu teléfono.',
  },
};

export type Copy = typeof es;
