import type { MissingPiece } from '../domain/types';
import type { Copy } from './es';

const MISSING: Record<MissingPiece, string> = {
  shoes: 'shoes',
  top: 'a top',
  bottom: 'a bottom',
};

function missingBase(missing: MissingPiece[], onePieceWouldDo: boolean) {
  if (!onePieceWouldDo) return MISSING.shoes;
  if (missing.includes('top') && missing.includes('bottom'))
    return 'a top and a bottom, or a one-piece';
  return `${MISSING[missing.includes('top') ? 'top' : 'bottom']} or a one-piece`;
}

/** English. TypeScript keeps it in step with the Spanish catalog. */
export const en: Copy = {
  common: {
    appName: 'Arma tu outfit',
    retry: 'Try again',
    retryShort: 'Retry',
    tapToClose: 'Tap to close',
    optional: 'optional',
    save: 'Save',
    back: 'Back',
    close: 'Close',
    comingSoon: 'Coming soon…',
  },
  /** "a, b and c". */
  list: (items: string[]) =>
    items.length > 1
      ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
      : (items[0] ?? ''),
  categories: {
    top: 'Top',
    bottom: 'Bottom',
    'one-piece': 'One-piece',
    shoes: 'Shoes',
    layer: 'Outer layer',
    accessory: 'Accessory',
  },
  occasions: {
    casual: 'Everyday',
    work: 'Work',
    formal: 'Formal event',
    sport: 'Exercise',
    outing: 'Going out',
  },
  styles: {
    minimal: {
      label: 'Minimal',
      description: 'Simple lines and understated combinations.',
    },
    classic: {
      label: 'Classic',
      description: 'Timeless pieces and sober details.',
    },
    street: {
      label: 'Street',
      description: 'Street inspiration and casual contrasts.',
    },
    relaxed: {
      label: 'Relaxed',
      description: 'Comfort and an easygoing feel.',
    },
    creative: {
      label: 'Creative',
      description: 'Colors, mixes and details with personality.',
    },
    sport: {
      label: 'Sporty',
      description: 'Pieces with an athletic touch.',
    },
    girly: {
      label: 'Girly',
      description: 'Soft tones, bows and playful details.',
    },
    feminine: {
      label: 'Feminine',
      description: 'Defined silhouettes and delicate details.',
    },
  },
  colors: {
    negro: 'Black',
    blanco: 'White',
    gris: 'Gray',
    beige: 'Beige',
    azul: 'Blue',
    verde: 'Green',
    cafe: 'Brown',
    rojo: 'Red',
    rosa: 'Pink',
    amarillo: 'Yellow',
    morado: 'Purple',
    naranja: 'Orange',
  },
  reasons: {
    style: (styles: string) => `Today we’re going ${styles}.`,
    lightlyUsed: 'We bring items you hardly wear.',
    occasion: {
      casual: 'We’re made for your everyday.',
      work: 'We’re made for work.',
      formal: 'We’re made for a formal event.',
      sport: 'We’re made for moving.',
      outing: 'We’re made for going out.',
    },
    warmth: (degrees: number) => `We worked out the warmth for ${degrees} °C.`,
    favoriteColor: 'We’re wearing a color you like.',
    rotation: (days: number) => `No wear logged for us in ${days} days.`,
    rainReady: 'Shoes and layer are marked for rain.',
    oneColor: 'We’re all in one color.',
  },
  warnings: {
    occasionUntagged: 'Some items aren’t tagged for this occasion',
    warmth: (degrees: number) => `Check the warmth for ${degrees} °C`,
    wornRecently: 'Includes recently worn items',
    shoesNotRainReady: 'Shoes not marked for rain',
    noRainLayer: 'No layer marked for rain',
  },
  problems: {
    recommendation: (problem) => {
      switch (problem.kind) {
        case 'empty':
          return 'Your closet is empty. Add your first item.';
        case 'pinned-gone':
          return 'That item is no longer in your closet.';
        case 'pinned-unavailable':
          return 'Mark this item as available to style it.';
        case 'pinned-excluded':
          return 'This item has a color you avoid. You can change that in your preferences.';
        case 'pinned-missing':
          return `To style this item, add ${problem.missing.map((piece) => MISSING[piece]).join(' and ')} or check availability and the colors you avoid.`;
        case 'missing':
          return `You need ${missingBase(problem.missing, problem.onePieceWouldDo)} available without the colors you avoid. Add items or check availability and preferences.`;
      }
    },
    swap: (problem, category) => {
      switch (problem) {
        case 'outfit-changed':
          return 'The outfit changed or has items that aren’t available. Get new ideas.';
        case 'slot-missing':
          return 'This outfit has no item of that kind to swap.';
        case 'no-option':
          return `There’s no other ${en.categories[category].toLowerCase()} available that fits your preferences.`;
        default:
          return '';
      }
    },
  },
  demoNames: {
    'demo2-tee-white': 'White tee',
    'demo2-tee-gray': 'Gray tee',
    'demo2-shirt-denim': 'Denim shirt',
    'demo2-sweater-navy': 'Navy sweater',
    'demo2-top-black': 'Black top',
    'demo2-jacket-denim': 'Denim jacket',
    'demo2-jeans-blue': 'Blue jeans',
    'demo2-dress-white': 'White dress',
    'demo2-shoes-red': 'Red shoes',
    'demo2-boots-brown': 'Brown ankle boots',
  },
  storage: {
    loadFailed:
      'We couldn’t open your local data. It wasn’t replaced. Try again; if it keeps happening, keep the browser or app data so it can be recovered.',
    saveFailedBecause: (reason: string) =>
      `${reason} Your latest changes are still on this screen. Retry before closing it.`,
    saveFailed:
      'Your latest changes weren’t saved. Check the available space and try again. Keep this screen open.',
    errors: {
      incompatible:
        'The saved format isn’t compatible. Your data wasn’t replaced.',
      incomplete: 'The change wasn’t saved because it has incomplete data.',
      'web-limit':
        'The web preview’s photo limit was reached. Shrink or remove a photo and save again. Previously saved data is kept.',
    },
  },
  today: {
    title: 'Today',
    aiChosen: 'Top pick chosen with AI.',
    aiPending: 'Asking…',
    aiChoose: 'Choose with AI',
    aiFailed: 'Couldn’t reach the AI.',
    emptyTitle: 'No outfits yet',
    noMoreIdeas: 'I’m out of ideas for today.',
    goToCloset: 'Go to my closet',
    showPrevious: 'Show earlier ones',
    reviewStyle: 'Review my style',
  },
  closet: {
    all: 'All',
    edit: (name: string) => `Edit ${name}`,
    emptyCategory: 'You have no items in this category.',
    title: 'My closet',
    count: (total: number, available: number) =>
      `${total} ${total === 1 ? 'item' : 'items'} · ${available} available`,
    addShort: '+ Add item',
    add: 'Add item',
    build: 'Build an outfit',
    emptyHint:
      'An outfit needs a top, a bottom and shoes; or a one-piece and shoes.',
    showDemo: 'See the example closet',
  },
  style: {
    title: 'My style',
    colors: 'Colors',
  },
  combine: {
    title: 'Style it',
    stays: (name: string) => `${name} stays.`,
  },
  settings: {
    title: 'Settings',
    theme: 'Theme',
    language: 'Language',
    languageAuto: 'Automatic',
    rotation: 'Wait before repeating an item',
    days: (days: number) => `${days} days`,
    noWait: 'None',
    personalize: 'Personalize again',
    dataTitle: 'Your data',
    dataPrivacy:
      'Your clothes and photos are stored only on this device, with no cloud copy. If you delete the app, they are lost. Only Analyze photo sends a photo of an item to OpenAI.',
    dataCounts: (own: number, worn: number) =>
      `${own} ${own === 1 ? 'item of your own' : 'items of your own'} · ${worn} ${worn === 1 ? 'wear logged' : 'wears logged'}`,
    weatherCredit: 'Automatic weather: data from Open-Meteo',
  },
  notices: {
    goalSaved: 'Your goal is saved.',
    stylesSaved: 'Your styles are saved.',
    itemSaved: 'Done, it’s saved.',
    allSet: (name: string) => (name ? `All set, ${name}.` : 'All set.'),
    unsaved: 'Removed from saved.',
    outfitSaved: 'Outfit saved.',
    wearFailed:
      'Couldn’t log it: check the date and that the items are still available.',
    alreadyWorn: 'You already logged it today.',
    worn: 'Noted: you wore it today.',
    demoReady: 'Done, this is the example closet.',
    swapped: 'Item swapped for another from your closet.',
  },
  appearance: {
    layout: 'Layout',
    wide: 'Roomy',
    compact: 'Compact',
    reasons: 'Explanations',
    warningsStay: 'Warnings stay visible.',
    reasonsToggle: 'Show outfit explanations',
    haptics: 'Vibration',
    themeLabel: (name: string) => `${name} theme`,
  },
  themes: {
    linen: 'Linen',
    paper: 'Paper',
    midnight: 'Midnight',
    sage: 'Sage',
    bubblegum: 'Bubblegum',
    mauve: 'Mauve',
  },
  demo: {
    banner: 'EXAMPLE CLOSET',
    useMine: 'Use my clothes',
  },
  outfit: {
    save: 'Save outfit',
    unsave: 'Remove outfit from saved',
    wore: 'I wore it today',
    another: 'Show me another',
    title: 'Your outfit',
    savedNote: 'Saved as it was; it doesn’t consider today’s weather.',
    page: (page: number, total: number) => `Idea ${page} of ${total}`,
    pageCount: (page: number, total: number) => `${page} of ${total}`,
  },
  swap: {
    title: (category: string) => `Swap · ${category}`,
    insteadOf: (name: string) => `Instead of ${name}.`,
    swapFor: (name: string) => `Swap for ${name}`,
    none: (excludedColors: boolean) =>
      `No other one available${excludedColors ? ' without the colors you avoid' : ''}. Add one in My closet.`,
  },
  art: {
    photo: 'Photo',
    demoPhoto: 'Example photo',
    drawing: 'Generic drawing',
    laundry: 'Laundry',
    inLaundrySuffix: ', in the laundry',
    colorsSuffix: (colors: string) => `. Colors: ${colors}`,
    ofName: (name: string) => ` of ${name}`,
    pinned: (name: string) => `${name}, chosen item`,
    change: (name: string) => `Swap ${name}`,
  },
  wearMore: {
    eyebrow: 'One more round',
    label: (name: string) => `One more round: see ideas with ${name}`,
  },
  weather: {
    automatic: 'Automatic',
    manual: 'Manual',
    manualShort: 'manual',
    pillLabel: (degrees: number, automatic: boolean, occasion: string) =>
      `Edit weather and occasion. ${degrees} degrees${automatic ? '' : ', manual weather'}, ${occasion}`,
    loading: 'Checking the weather. Meanwhile, the manual one is used.',
    usingManual: (error: string) =>
      `${error || 'No recent weather.'} Using the manual weather.`,
    refreshLabel: 'Refresh weather',
    refresh: 'Refresh',
    errors: {
      network: 'Couldn’t connect to the weather service.',
      http: 'The weather service isn’t available.',
      invalid: 'The service returned incomplete weather data.',
      timeout: 'The weather took too long. Try again.',
      aborted: 'Request canceled.',
    },
  },
  context: {
    title: 'Weather and occasion',
    apply: 'Apply',
    chooseCity: 'Choose a city for automatic weather.',
    occasion: 'Occasion',
    weather: 'Weather',
    changeCity: 'Change city',
    change: 'Change',
    backup: (degrees: number, raining: boolean) =>
      `Without recent data, the manual weather is used: ${degrees}°, ${raining ? 'rain' : 'no rain'}.`,
    changeBackup: 'Change the backup manual weather',
    backupTitle: 'Manual weather, for when there’s no recent data',
  },
  city: {
    selected: 'Selected:',
    locating: 'Finding your city…',
    updateWithLocation: 'Update with my location',
    useLocation: 'Use my location',
    locationPrivacy:
      'Only to find your city. We don’t store your exact location.',
    denied: 'No location permission. Search for your city by name.',
    blocked:
      'Location is blocked for this app. Turn it on in Settings or search for your city.',
    openSettings: 'Open Settings',
    openSettingsFailed: 'Open Settings and turn on Location for this app.',
    searchByName: 'Search by name',
    search: 'Search city',
    placeholder: 'City name',
    searching: 'Searching…',
    notFound: 'We couldn’t find that city. Try another name.',
    searchFailed: 'We couldn’t search for the city.',
    failures: {
      'services-off':
        'Device location is off. Turn it on or search for your city by name.',
      position: 'We couldn’t get your location. Search for your city by name.',
      'not-found': 'We couldn’t identify your city. Search for it by name.',
      network: 'Couldn’t connect to the weather service.',
      http: 'The weather service isn’t available.',
      invalid: 'Type a city of up to 120 characters.',
      timeout: 'The weather took too long. Try again.',
      aborted: 'Request canceled.',
    },
  },
  manualWeather: {
    temperature: 'Temperature',
    lower: 'Lower the temperature',
    raise: 'Raise the temperature',
    degrees: (degrees: number) => `${degrees} degrees Celsius`,
    rain: 'Rain',
    raining: 'It’s raining',
  },
  itemForm: {
    colorsRequired: 'Choose at least one color.',
    occasionsRequired: 'Choose at least one occasion.',
    suggestedName: (category: string, colors: string[], more: boolean) =>
      `${category} · ${colors.join(' and ')}${more ? ' and more' : ''}`,
  },
  itemEditor: {
    editTitle: 'Edit item',
    saveChanges: 'Save changes',
    noOccasion: 'No occasion',
    warmth: ['Very light', 'Light', 'Warm', 'Very warm'],
    forRain: 'For rain',
    styleCount: (count: number) =>
      `${count} ${count === 1 ? 'style' : 'styles'}`,
    moreDetails: 'More details',
    usedFor: 'What do you wear it for?',
    warmthTitle: 'How warm it is',
    rainUse: 'I wear it when it rains',
    rainReady: 'Rain-ready',
    stylesTitle: 'Styles · optional',
    upToThree: 'Up to 3.',
    tooManyStyles: 'Choose up to three styles. Remove one to try another.',
    discardQuestion: 'Discard changes?',
    keepEditing: 'Keep editing',
    discard: 'Discard changes',
    nameTitle: 'Name · optional',
    nameLabel: 'Item name, optional',
    nameHint: (suggested: string) =>
      `If you leave it empty it will be called ${suggested}`,
    namePlaceholder: 'E.g. The wedding shirt',
    available: 'Available to wear',
    availableHint: 'Turn it off if it’s in the laundry.',
    wearMore: 'I want to wear it more',
    whatIsIt: 'What is it?',
    whichColor: 'What color?',
  },
  photo: {
    saving: 'Saving photo…',
    choose: 'Choose photo',
    take: 'Take photo',
    openSettingsFailed: 'Open Settings and turn on Camera for this app.',
    remove: 'Remove photo',
    keepBackground: 'Use the photo with its background',
    cutting: 'Removing background…',
    cut: 'Remove background',
    cutLocal: 'It happens on this phone; the photo isn’t sent.',
    analyzing: 'Analyzing…',
    retryAnalysis: 'Retry analysis',
    analyzeAgain: 'Analyze again',
    analyze: 'Analyze photo',
    analyzeWithAi: 'Analyze photo with AI',
    analysisPrivacy:
      'This photo will be sent to OpenAI to suggest a name, category and colors.',
    cancelAnalysis: 'Cancel analysis',
    cameraDenied: 'Allow the camera to take a photo.',
    cameraBlocked:
      'The camera is blocked. Turn it on in Settings or choose a photo.',
    saveFailed:
      'We couldn’t save the photo. Check the permission or use a smaller image; you can also continue without a photo.',
    cutoutFailed:
      'We couldn’t remove the background. You can use the original photo.',
    analysisFailed:
      'We couldn’t analyze the photo. You can fill in the details yourself.',
    applied: 'Details applied. Check the other fields and save the item.',
    rejections: {
      multiple_garments:
        'There are several items in the photo. Use a photo of a single item.',
      unclear:
        'No single item can be made out clearly. Try another photo or fill in the details yourself.',
      not_garment:
        'We didn’t find an item of clothing in the photo. Choose another photo or fill in the details yourself.',
    },
    aiErrors: {
      configuration:
        'Analysis isn’t set up. You can fill in the item yourself.',
      image: 'Use a JPEG, PNG or WebP photo of up to 4 MiB.',
      network:
        'We couldn’t connect to the analysis. You can retry or fill in the item yourself.',
      timeout:
        'The analysis took too long. You can retry or fill in the item yourself.',
      aborted: 'Analysis canceled.',
      response:
        'The analysis returned incomplete data. Your form wasn’t changed.',
      server:
        'We couldn’t analyze the photo. You can retry or fill in the item yourself.',
    },
  },
  suggestionReview: {
    title: 'Review analysis',
    hint: 'Correct anything needed before applying it.',
    name: 'Suggested name',
    nameLabel: 'Name suggested by the analysis',
    category: 'Suggested category',
    colors: 'Suggested colors',
    apply: 'Apply these details',
    nameRequired: 'Type a name.',
    invalid: 'Check the name, category and colors.',
    dismiss: 'Dismiss analysis',
  },
  builder: {
    missing: (pieces: string) => `Still to choose: ${pieces}.`,
    separates: 'Top + bottom',
    stage: (names: string) => `Your outfit: ${names}.`,
    empty: 'Your outfit, empty.',
    stageMissing: (pieces: string) => `Missing: ${pieces}.`,
    noneAvailable: 'No items available in this category yet.',
  },
  colorPicker: {
    favorite: 'I like',
    avoid: 'I’d rather avoid',
    favoriteHint: 'I use them first in your outfits.',
    avoidHint: 'I won’t suggest items in these colors.',
    tileLabel: (
      name: string,
      selected: boolean,
      inOther: boolean,
      mode: 'favorite' | 'avoid',
    ) =>
      `${name}${selected ? ', selected' : ''}${inOther ? `, currently ${mode === 'favorite' ? 'avoided' : 'a favorite'}` : ''}`,
    youAvoid: 'You avoid it',
    youLike: 'You like it',
  },
  saved: {
    title: 'Saved',
    open: (names: string) => `Open saved outfit: ${names}`,
    byYou: 'Made by you',
    saved: 'Saved',
    items: (count: number) => `${count} items`,
    empty: 'You haven’t saved any outfits yet. Tap ♡ in Today to save one.',
  },
  styleBoard: {
    current: 'How I dress',
    currentEmpty: 'Choose your styles',
    goal: 'I want to try',
    goalEmpty: 'Choose how you want to look',
    edit: 'Edit',
    choose: 'Choose',
    full: 'Up to 3. Remove one to choose another.',
    stylePrefix: 'Style',
  },
  explore: {
    label: 'Today I’m up for something new',
    toggle: 'Something new',
    gaps: (pieces: string) =>
      `For that look you’re missing: ${pieces}. Tag your items or add some.`,
  },
  styleGoal: {
    colorTest: 'Color analysis',
    title: 'Change my style',
    wantMore: 'I’d like to look more…',
    toneTitle: 'Your color analysis · optional',
    testHint:
      'Compare colors next to your face. Your photo never leaves the phone.',
    repeatTest: 'Repeat the test',
    takeTest: 'Take the test',
    removeResult: 'Remove result',
    yourColors: 'Your colors',
    yourColorsHint: 'The ones you choose are added to your favorites.',
  },
  colorTest: {
    introSay: 'I’m Bufi, the scarf. Let’s compare colors next to your face.',
    introTitle: 'Your color analysis',
    steps: (count: number) => `It’s ${count} quick comparisons.`,
    tips: [
      'Natural light, facing a window.',
      'No filters and little makeup.',
      'Come close: let your face fill the photo, with your hair pulled back.',
    ],
    privacy: 'Your photo never leaves the phone and isn’t saved.',
    takeSelfie: 'Take a selfie',
    choosePhoto: 'Choose a photo',
    resultSay: 'Based on what you chose, you are…',
    lowConfidence: 'It was very close. If you can, repeat it in better light.',
    simulation:
      'It’s a simulation: it depends on the light, the photo and your screen.',
    useColors: 'Use my colors',
    rounds: ['First, temperature', 'Now, intensity', 'Final adjustment'],
    question: 'Which one makes your skin look more even?',
    questionHint:
      'Look at dark circles, shadows and redness. Tap your favorite.',
    left: 'left',
    right: 'right',
    chooseSide: (side: string, name: string) => `Choose ${side}: ${name}`,
    tie: 'I can’t tell the difference',
    cameraDenied: 'Allow the camera to take your selfie.',
    photoFailed: 'We couldn’t open that photo. Try another one.',
  },
  tones: {
    'spring-light': {
      label: 'Light Spring',
      description: 'Warm, luminous and soft colors.',
    },
    'spring-bright': {
      label: 'Bright Spring',
      description: 'Warm, vivid and cheerful colors.',
    },
    'summer-light': {
      label: 'Light Summer',
      description: 'Cool, light and delicate colors.',
    },
    'summer-mute': {
      label: 'Soft Summer',
      description: 'Cool, grayish and calm colors.',
    },
    'autumn-mute': {
      label: 'Soft Autumn',
      description: 'Warm, earthy and muted colors.',
    },
    'autumn-deep': {
      label: 'Deep Autumn',
      description: 'Warm, intense and dark colors.',
    },
    'winter-bright': {
      label: 'Bright Winter',
      description: 'Cool, pure and high-contrast colors.',
    },
    'winter-deep': {
      label: 'Deep Winter',
      description: 'Cool, dark and elegant colors.',
    },
  },
  drapes: {
    coral: 'Coral',
    fuchsia: 'Fuchsia',
    gold: 'Gold',
    silver: 'Silver',
    olive: 'Olive',
    teal: 'Teal',
    peach: 'Peach',
    terracotta: 'Terracotta',
    'apple-green': 'Apple green',
    moss: 'Moss',
    turquoise: 'Turquoise',
    petrol: 'Petrol',
    lavender: 'Lavender',
    violet: 'Violet',
    'dusty-pink': 'Dusty pink',
    magenta: 'Magenta',
    'gray-blue': 'Gray blue',
    'royal-blue': 'Royal blue',
    apricot: 'Apricot',
    'bright-orange': 'Bright orange',
    'soft-green': 'Soft green',
    'bright-green': 'Bright green',
    vanilla: 'Vanilla',
    'bright-yellow': 'Bright yellow',
    'light-lilac': 'Light lilac',
    'gray-mauve': 'Gray mauve',
    'pale-blue': 'Pale blue',
    'smoke-blue': 'Smoke blue',
    'pale-pink': 'Pale pink',
    'old-rose': 'Old rose',
    camel: 'Camel',
    chocolate: 'Chocolate',
    sage: 'Sage',
    'forest-green': 'Forest green',
    'soft-tile': 'Soft brick',
    'burnt-wine': 'Burnt wine',
    'bright-fuchsia': 'Bright fuchsia',
    'cool-wine': 'Cool wine',
    'electric-blue': 'Electric blue',
    navy: 'Navy',
    emerald: 'Emerald',
    pine: 'Pine',
  },
  onboarding: {
    outfitSay:
      'I’m Teni, the sneakers. I put this together from what you told me.',
    outfitTitle: 'Your first outfit',
    occasionQuestion: 'What do you usually dress for?',
    done: 'Done!',
    startWith: 'Which clothes do we start with?',
    ownClothes: 'Let’s use my clothes',
    colorsSay: 'I’m Chama, the jacket. Let’s talk colors.',
    colorsTitle: 'Which colors do you like?',
    crewHello: 'Hi! I’m Tere.',
    noPreview:
      'Nothing came up with those choices. Adjust them whenever you like.',
    exampleOutfit: 'Example outfit with made-up items',
    exampleTag: 'Example with made-up items',
    helloSay: (name: string) =>
      name ? `Nice to meet you, ${name}. I’m Tere.` : 'Hi! I’m Tere, your tee.',
    nameTitle: 'What’s your name?',
    nameLabel: 'Your name, optional',
    namePlaceholder: 'Your name · optional',
    struggleQuestion: 'What’s hard about getting dressed?',
    struggles: {
      decide: {
        label: 'I take too long to decide',
        reply: 'I’ll handle that: every day I suggest up to three outfits.',
      },
      colors: {
        label: 'Matching colors is hard',
        reply:
          'In a moment you’ll tell me which ones you like and which to avoid.',
      },
      weather: {
        label: 'I never get the weather right',
        reply:
          'Tell me your city and I’ll match the warmth to today’s weather.',
      },
      style: {
        label: 'I want to change my style',
        reply: 'Tell me how you want to look and we’ll build toward it.',
      },
    },
    cityTitle: 'Your city · optional',
    closeLabel: 'Close personalization',
    stepLabel: (step: number, total: number) => `Step ${step} of ${total}`,
    later: 'I’ll do it later',
    next: ['Let’s continue', 'Now the colors', 'See my outfit'],
    styleSay: (name: string) =>
      `${name ? `${name}, I’m` : 'I’m'} Cami, the shirt. Tell me about your clothes.`,
    styleTitle: 'How do you usually dress?',
    goalQuestion: 'And how would you like to look?',
    styleHint: 'Up to 3 in each group · Optional',
    welcome:
      'Tere, Cami and friends help you choose what to wear with the clothes you already have.',
    welcomeStart: 'Let’s go to your closet',
    welcomePrivacy: 'No account. Your data stays on your phone.',
  },
};
