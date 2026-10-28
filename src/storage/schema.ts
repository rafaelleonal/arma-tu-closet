import {
  CATEGORIES,
  OCCASIONS,
  STYLE_IDS,
  isValidOutfit,
  type Context,
  type Outfit,
  type StyleId,
  type WardrobeItem,
} from '../domain';
import { createDefaultWeather, isWeatherSettings, type WeatherSettings } from '../weather/types';

export type Preferences = Pick<Context, 'preferredColors' | 'excludedColors' | 'rotationDays'>;
export const THEME_IDS = ['linen', 'paper', 'midnight', 'sage', 'bubblegum', 'mauve'] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export interface Profile {
  name: string;
  styleIds: StyleId[];
}
export interface Appearance {
  themeId: ThemeId;
  outfitLayout: 'editorial' | 'compact';
  showReasons: boolean;
  /** Optional in v3: older documents retain the default enabled behavior. */
  hapticsEnabled?: boolean;
}
export interface OnboardingProgress {
  step: 0 | 1 | 2 | 3;
}

interface CommonLocalData {
  onboarded: boolean;
  items: WardrobeItem[];
  preferences: Preferences;
  context: Pick<Context, 'occasion' | 'temperatureC' | 'raining'> & {
    city: string;
    season: string;
  };
  savedOutfits: Outfit[];
  dislikedOutfitIds: string[];
  wearHistory: { id: string; itemIds: string[]; date: string }[];
}
export interface LegacyLocalData extends CommonLocalData {
  version: 1;
}
interface PersonalizedLocalData extends CommonLocalData {
  profile: Profile;
  appearance: Appearance;
  onboarding?: OnboardingProgress;
}
export interface LegacyLocalDataV2 extends PersonalizedLocalData {
  version: 2;
}
export interface LocalData extends PersonalizedLocalData {
  version: 3;
  weather: WeatherSettings;
}

export function createDefaultProfile(): Profile {
  return { name: '', styleIds: [] };
}
export function createDefaultAppearance(): Appearance {
  return { themeId: 'linen', outfitLayout: 'editorial', showReasons: true };
}
export function createLocalData(): LocalData {
  return {
    version: 3,
    onboarded: false,
    items: [],
    profile: createDefaultProfile(),
    appearance: createDefaultAppearance(),
    onboarding: { step: 0 },
    weather: createDefaultWeather(),
    preferences: { preferredColors: [], excludedColors: [], rotationDays: 3 },
    context: { occasion: 'casual', temperatureC: 22, raining: false, city: '', season: 'Otoño' },
    savedOutfits: [],
    dislikedOutfitIds: [],
    wearHistory: [],
  };
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(nonempty);
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const known = (value: unknown, choices: readonly string[]) =>
  typeof value === 'string' && choices.includes(value);
const styles = (value: unknown): value is StyleId[] =>
  strings(value) &&
  value.every((style) => known(style, STYLE_IDS)) &&
  new Set(value).size === value.length;

function wardrobeItem(value: unknown): value is WardrobeItem {
  return (
    record(value) &&
    nonempty(value.id) &&
    nonempty(value.name) &&
    known(value.category, CATEGORIES) &&
    strings(value.colors) &&
    value.colors.length > 0 &&
    strings(value.occasions) &&
    value.occasions.length > 0 &&
    value.occasions.every((occasion) => known(occasion, OCCASIONS)) &&
    finite(value.warmth) &&
    Number.isInteger(value.warmth) &&
    value.warmth >= 0 &&
    value.warmth <= 3 &&
    typeof value.rainReady === 'boolean' &&
    typeof value.available === 'boolean' &&
    (value.lastWornAt === undefined || date(value.lastWornAt)) &&
    (value.wearCount === undefined ||
      (finite(value.wearCount) && Number.isInteger(value.wearCount) && value.wearCount >= 0)) &&
    (value.photoUri === undefined || nonempty(value.photoUri)) &&
    (value.cutoutUri === undefined || (nonempty(value.cutoutUri) && nonempty(value.photoUri))) &&
    (value.isDemo === undefined || typeof value.isDemo === 'boolean') &&
    (value.styleIds === undefined || styles(value.styleIds))
  );
}

function outfit(value: unknown): value is Outfit {
  return (
    record(value) &&
    nonempty(value.id) &&
    finite(value.score) &&
    strings(value.reasons) &&
    strings(value.warnings) &&
    Array.isArray(value.items) &&
    value.items.every(wardrobeItem) &&
    isValidOutfit(value.items)
  );
}

function commonLocalData(value: unknown): value is CommonLocalData & Record<string, unknown> {
  if (
    !record(value) ||
    typeof value.onboarded !== 'boolean' ||
    !Array.isArray(value.items) ||
    !value.items.every(wardrobeItem) ||
    new Set(value.items.map((item) => item.id)).size !== value.items.length
  )
    return false;
  const { preferences, context } = value;
  return (
    record(preferences) &&
    strings(preferences.preferredColors) &&
    strings(preferences.excludedColors) &&
    finite(preferences.rotationDays) &&
    preferences.rotationDays >= 0 &&
    record(context) &&
    known(context.occasion, OCCASIONS) &&
    finite(context.temperatureC) &&
    context.temperatureC >= -30 &&
    context.temperatureC <= 55 &&
    typeof context.raining === 'boolean' &&
    typeof context.city === 'string' &&
    typeof context.season === 'string' &&
    Array.isArray(value.savedOutfits) &&
    value.savedOutfits.every(outfit) &&
    new Set(value.savedOutfits.map((item) => item.id)).size === value.savedOutfits.length &&
    strings(value.dislikedOutfitIds) &&
    Array.isArray(value.wearHistory) &&
    value.wearHistory.every(
      (entry) =>
        record(entry) &&
        nonempty(entry.id) &&
        strings(entry.itemIds) &&
        entry.itemIds.length > 0 &&
        date(entry.date),
    )
  );
}

function personalizedLocalData(
  value: unknown,
): value is PersonalizedLocalData & Record<string, unknown> {
  if (!commonLocalData(value)) return false;
  const { profile, appearance, onboarding } = value;
  return (
    record(profile) &&
    typeof profile.name === 'string' &&
    styles(profile.styleIds) &&
    record(appearance) &&
    known(appearance.themeId, THEME_IDS) &&
    known(appearance.outfitLayout, ['editorial', 'compact']) &&
    typeof appearance.showReasons === 'boolean' &&
    (appearance.hapticsEnabled === undefined || typeof appearance.hapticsEnabled === 'boolean') &&
    (onboarding === undefined ||
      (record(onboarding) &&
        finite(onboarding.step) &&
        Number.isInteger(onboarding.step) &&
        onboarding.step >= 0 &&
        onboarding.step <= 3))
  );
}

export function isLocalData(value: unknown): value is LocalData {
  return personalizedLocalData(value) && value.version === 3 && isWeatherSettings(value.weather);
}

function isLegacyLocalData(value: unknown): value is LegacyLocalData {
  return commonLocalData(value) && value.version === 1;
}

/** Read-only v1/v2 migration at the existing storage key. Unknown versions never become fresh data. */
export function parseLocalData(raw: string): LocalData {
  const value: unknown = JSON.parse(raw);
  if (isLegacyLocalData(value)) {
    // Existing completion state and every v1 field stay intact. No new onboarding
    // marker is added; completed users only revisit setup by their own action.
    return {
      ...value,
      version: 3,
      profile: createDefaultProfile(),
      appearance: createDefaultAppearance(),
      weather: createDefaultWeather(),
    };
  }
  if (personalizedLocalData(value) && value.version === 2)
    return { ...value, version: 3, weather: createDefaultWeather() };
  if (!isLocalData(value))
    throw new Error('El formato guardado no es compatible. Tus datos no se reemplazaron.');
  return value;
}

// Conservative bound for the web preview's shared localStorage quota, including
// photos duplicated in saved outfits. Native files are stored outside this JSON.
export const MAX_WEB_PAYLOAD_CHARS = 2_000_000;
export function serializeLocalData(data: LocalData, web = false): string {
  if (!isLocalData(data))
    throw new Error('No se guardó el cambio porque contiene datos incompletos.');
  const payload = JSON.stringify(data);
  if (web && payload.length > MAX_WEB_PAYLOAD_CHARS) {
    throw new Error(
      'Se alcanzó el límite de fotos de la vista web. Reduce o quita una foto y vuelve a guardar. Los datos guardados anteriormente se conservan.',
    );
  }
  return payload;
}
