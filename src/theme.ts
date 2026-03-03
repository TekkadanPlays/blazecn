// ---------------------------------------------------------------------------
// Theme store — persists base color theme + dark mode to localStorage
//
// Provides a centralized theme system for blazecn components.
// Components subscribe via subscribeTheme() and react to changes.
// The active theme class (.theme-*) and .dark class are applied to <html>.
// ---------------------------------------------------------------------------

export type BaseTheme =
  | 'neutral' | 'stone' | 'zinc' | 'gray'
  | 'amber' | 'blue' | 'cyan' | 'emerald' | 'fuchsia' | 'green'
  | 'indigo' | 'lime' | 'orange' | 'pink' | 'purple' | 'red'
  | 'rose' | 'sky' | 'teal' | 'violet';

let THEME_KEY = 'blazecn_base_theme';
let DARK_KEY = 'blazecn_dark_mode';

/**
 * Configure the localStorage key prefix used by the theme store.
 * Call this before initTheme() if you need custom keys (e.g. for migration).
 */
export function setThemeKeys(themeKey: string, darkKey: string) {
  THEME_KEY = themeKey;
  DARK_KEY = darkKey;
}

type ThemeListener = () => void;
let _listeners: ThemeListener[] = [];

function notify() { _listeners.forEach((fn) => fn()); }

export function subscribeTheme(fn: ThemeListener): () => void {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

const VALID_THEMES: Set<string> = new Set([
  'neutral', 'stone', 'zinc', 'gray',
  'amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green',
  'indigo', 'lime', 'orange', 'pink', 'purple', 'red',
  'rose', 'sky', 'teal', 'violet',
]);

export function getBaseTheme(): BaseTheme {
  if (typeof window === 'undefined') return 'neutral';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored && VALID_THEMES.has(stored)) return stored as BaseTheme;
  return 'neutral';
}

export function setBaseTheme(theme: BaseTheme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
  notify();
}

export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function setDarkMode(dark: boolean) {
  localStorage.setItem(DARK_KEY, String(dark));
  applyTheme();
  notify();
}

export function toggleDarkMode() {
  setDarkMode(!isDarkMode());
}

export function applyTheme() {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const dark = isDarkMode();
  const base = getBaseTheme();

  // Dark mode
  if (dark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  // Base color theme — remove all theme-* classes, then add current
  Array.from(html.classList)
    .filter((c) => c.startsWith('theme-'))
    .forEach((c) => html.classList.remove(c));
  if (base !== 'neutral') {
    html.classList.add(`theme-${base}`);
  }
}

/**
 * Initialize theme on page load. Call once in your app entry point.
 * Applies persisted dark mode and base theme to <html>.
 */
export function initTheme() {
  applyTheme();
}
