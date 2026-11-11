import React, { createContext, useContext, useMemo } from 'react';
import { getLocales } from 'expo-localization';
import { en } from './en';
import { es, type Copy } from './es';
export type { Copy } from './es';
export { colorName, reasonText, warningText } from './describe';

export const LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

const CATALOGS: Record<Language, Copy> = { es, en };
/** Region used for dates when the device's own region speaks another language. */
const DEFAULT_LOCALE: Record<Language, string> = { es: 'es-MX', en: 'en-US' };

function isLanguage(value: unknown): value is Language {
  return (LANGUAGES as readonly unknown[]).includes(value);
}

function deviceLocales() {
  try {
    return getLocales();
  } catch {
    return [];
  }
}

/** The first device language the app speaks; Spanish when none matches. */
export function deviceLanguage(): Language {
  const match = deviceLocales().find((locale) =>
    isLanguage(locale.languageCode),
  );
  return (match?.languageCode as Language | undefined) ?? 'es';
}

/** The device's own tag when it speaks `language` (en-GB keeps its date order). */
export function localeFor(language: Language): string {
  const match = deviceLocales().find(
    (locale) => locale.languageCode === language,
  );
  return match?.languageTag ?? DEFAULT_LOCALE[language];
}

export function copyFor(language: Language): Copy {
  return CATALOGS[language];
}

interface I18n {
  language: Language;
  locale: string;
  t: Copy;
}

const I18nContext = createContext<I18n>({
  language: 'es',
  locale: DEFAULT_LOCALE.es,
  t: es,
});

/** `language` undefined follows the device. */
export function I18nProvider({
  language,
  children,
}: {
  language?: Language;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const active = language ?? deviceLanguage();
    return { language: active, locale: localeFor(active), t: copyFor(active) };
  }, [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}

/** The catalog of the active language: `t.today.title`. */
export function useCopy(): Copy {
  return useContext(I18nContext).t;
}
