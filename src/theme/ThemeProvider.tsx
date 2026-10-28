import React, { createContext, useContext, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { getTheme, type Palette, type ThemeId } from './palettes';
export { THEME_OPTIONS, getTheme } from './palettes';
export type { Palette, ThemeId } from './palettes';

const ThemeContext = createContext<{ palette: Palette; themeId: ThemeId; isDark: boolean }>({
  palette: getTheme('linen'),
  themeId: 'linen',
  isDark: false,
});

export function ThemeProvider({
  themeId,
  children,
}: {
  themeId: ThemeId;
  children: React.ReactNode;
}) {
  const theme = useMemo(
    () => ({ palette: getTheme(themeId), themeId, isDark: themeId === 'midnight' }),
    [themeId],
  );
  return (
    <ThemeContext.Provider value={theme}>
      {children}
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
