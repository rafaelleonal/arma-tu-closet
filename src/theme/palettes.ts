export type ThemeId =
  'linen' | 'paper' | 'midnight' | 'sage' | 'bubblegum' | 'mauve';
export interface Palette {
  paper: string;
  ink: string;
  muted: string;
  line: string;
  rust: string;
  green: string;
  white: string;
  wash: string;
  sand: string;
  onInk: string;
  art: string;
  overlay: string;
  floating: string;
  errorBg: string;
  swatchBorder: string;
}

export const THEME_OPTIONS: {
  id: ThemeId;
  name: string;
  description: string;
}[] = [
  { id: 'linen', name: 'Lino', description: 'Cálido y natural' },
  { id: 'paper', name: 'Papel', description: 'Claro y esencial' },
  { id: 'midnight', name: 'Medianoche', description: 'Oscuro y sereno' },
  { id: 'sage', name: 'Salvia', description: 'Un poco de calma' },
  { id: 'bubblegum', name: 'Chicle', description: 'Rosa y juguetón' },
  { id: 'mauve', name: 'Malva', description: 'Rosa empolvado y sobrio' },
];

const themes: Record<ThemeId, Palette> = {
  linen: {
    paper: '#F6F3EC',
    ink: '#242923',
    muted: '#60675B',
    line: '#D8DBD0',
    rust: '#95462F',
    green: '#526247',
    white: '#FFFFFF',
    wash: '#EAEDE1',
    sand: '#EDE6D9',
    onInk: '#FFFFFF',
    art: '#EAEDE3',
    overlay: '#24292388',
    floating: '#FFFFFFE6',
    errorBg: '#F4E0D7',
    swatchBorder: '#00000026',
  },
  paper: {
    paper: '#FAFAFA',
    ink: '#161719',
    muted: '#62656B',
    line: '#DDDFE3',
    rust: '#373B44',
    green: '#575D67',
    white: '#FFFFFF',
    wash: '#F0F1F3',
    sand: '#EBEDF0',
    onInk: '#FFFFFF',
    art: '#F0F1F3',
    overlay: '#16171988',
    floating: '#FFFFFFE6',
    errorBg: '#F7E8E4',
    swatchBorder: '#00000026',
  },
  midnight: {
    paper: '#101113',
    ink: '#F5F5F7',
    muted: '#ADB0B7',
    line: '#3C3F47',
    rust: '#CFBDF7',
    green: '#BCCBB2',
    white: '#1B1D21',
    wash: '#26292E',
    sand: '#2C2835',
    onInk: '#121315',
    art: '#292D33',
    overlay: '#000000B3',
    floating: '#34373EE6',
    errorBg: '#382637',
    swatchBorder: '#FFFFFF40',
  },
  sage: {
    paper: '#F0F4EF',
    ink: '#1C302A',
    muted: '#53665D',
    line: '#D0DCD2',
    rust: '#315F4C',
    green: '#41634F',
    white: '#FAFCF9',
    wash: '#E0EADF',
    sand: '#DCE7DB',
    onInk: '#FFFFFF',
    art: '#E2EBE0',
    overlay: '#1C302A88',
    floating: '#FAFCF9E6',
    errorBg: '#F0E2D8',
    swatchBorder: '#1C302A33',
  },
  bubblegum: {
    paper: '#FFF5F8',
    ink: '#3B1A2C',
    muted: '#7A4560',
    line: '#F3D2DF',
    rust: '#B5175A',
    green: '#8A2F66',
    white: '#FFFFFF',
    wash: '#FDE8F0',
    sand: '#FBDDE9',
    onInk: '#FFFFFF',
    art: '#FCE6EF',
    overlay: '#3B1A2C88',
    floating: '#FFFFFFE6',
    errorBg: '#FCE3E3',
    swatchBorder: '#3B1A2C26',
  },
  mauve: {
    paper: '#F8F2F3',
    ink: '#2D2127',
    muted: '#67545D',
    line: '#E4D6DB',
    rust: '#86435C',
    green: '#684F63',
    white: '#FFFDFD',
    wash: '#F0E5E8',
    sand: '#ECDEE2',
    onInk: '#FFFFFF',
    art: '#EFE4E7',
    overlay: '#2D212788',
    floating: '#FFFDFDE6',
    errorBg: '#F5E2DF',
    swatchBorder: '#2D212726',
  },
};

export function getTheme(id: ThemeId): Palette {
  return themes[id];
}
