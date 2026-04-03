export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  screenBg: string;
  cardBg: string;
  cardAltBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  chipBg: string;
  chipText: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  heroBg: string;
  heroText: string;
  heroMuted: string;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  screenBg: 'bg-stone-100',
  cardBg: 'bg-stone-50',
  cardAltBg: 'bg-white',
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-800',
  textMuted: 'text-slate-500',
  border: 'border-stone-200',
  chipBg: 'bg-stone-200',
  chipText: 'text-slate-600',
  inputBg: 'bg-white',
  inputBorder: 'border-stone-300',
  tabBarBg: '#fafaf9',
  tabBarBorder: '#e7e5e4',
  heroBg: 'bg-emerald-950',
  heroText: 'text-white',
  heroMuted: 'text-emerald-50/85',
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  screenBg: 'bg-slate-950',
  cardBg: 'bg-slate-900',
  cardAltBg: 'bg-slate-800',
  textPrimary: 'text-slate-50',
  textSecondary: 'text-slate-100',
  textMuted: 'text-slate-400',
  border: 'border-slate-700',
  chipBg: 'bg-slate-700',
  chipText: 'text-slate-200',
  inputBg: 'bg-slate-800',
  inputBorder: 'border-slate-600',
  tabBarBg: '#020617',
  tabBarBorder: '#334155',
  heroBg: 'bg-slate-900',
  heroText: 'text-white',
  heroMuted: 'text-slate-300',
};

export const getTheme = (isDarkMode: boolean) =>
  isDarkMode ? darkTheme : lightTheme;
