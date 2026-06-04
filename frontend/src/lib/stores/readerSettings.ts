/**
 * readerSettings store
 *
 * Persists user typography preferences (font family, font size, theme) in
 * localStorage so settings survive page reloads.  Every mutation is logged
 * with the previous → new value pair so they are easy to audit in DevTools.
 */

import { writable, get } from 'svelte/store';
import { createLogger } from '$lib/logger';

const log = createLogger('SETTINGS_STORE');

// ─── Types ────────────────────────────────────────────────────────────────────

export type FontFamily = 'serif' | 'sans' | 'legible';
export type Theme = 'light' | 'dark' | 'sepia';

export interface ReaderSettings {
  fontFamily: FontFamily;
  /** Font size step index (0–4), maps to FONT_SIZE_STEPS */
  fontSizeStep: number;
  theme: Theme;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** CSS custom-property values injected onto <html> at runtime */
export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  serif: "Georgia, Cambria, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  legible: "'Atkinson Hyperlegible', 'OpenDyslexic', Arial, sans-serif",
};

/** rem values for each step (index 0 = smallest, 4 = largest) */
export const FONT_SIZE_STEPS: readonly number[] = [1, 1.125, 1.25, 1.5, 1.75];

export const THEME_COLORS: Record<Theme, { bg: string; text: string }> = {
  light: { bg: '#ffffff', text: '#1a1a1a' },
  dark: { bg: '#121212', text: '#e0e0e0' },
  sepia: { bg: '#f4ecd8', text: '#5b4636' },
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'inkwhisper_reader_settings';

const DEFAULT_SETTINGS: ReaderSettings = {
  fontFamily: 'serif',
  fontSizeStep: 1,
  theme: 'light',
};

// ─── Hydration from localStorage ─────────────────────────────────────────────

function loadFromStorage(): ReaderSettings {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    const settings: ReaderSettings = {
      fontFamily: parsed.fontFamily ?? DEFAULT_SETTINGS.fontFamily,
      fontSizeStep: parsed.fontSizeStep ?? DEFAULT_SETTINGS.fontSizeStep,
      theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
    };
    log.info('Settings hydrated from localStorage', settings);
    return settings;
  } catch (err) {
    log.warn('Failed to parse settings from localStorage, using defaults', { error: String(err) });
    return { ...DEFAULT_SETTINGS };
  }
}

function saveToStorage(settings: ReaderSettings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    log.warn('Failed to persist settings to localStorage', { error: String(err) });
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

const _settings = writable<ReaderSettings>(loadFromStorage());

/** Subscribe to settings and apply CSS variables to the document root */
function applyCssVariables(settings: ReaderSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const fontSize = FONT_SIZE_STEPS[settings.fontSizeStep] ?? 1;
  const colors = THEME_COLORS[settings.theme];
  const fontFamily = FONT_FAMILY_MAP[settings.fontFamily];

  root.style.setProperty('--iw-font-family', fontFamily);
  root.style.setProperty('--iw-font-size', `${fontSize}rem`);
  root.style.setProperty('--iw-bg', colors.bg);
  root.style.setProperty('--iw-text', colors.text);
  root.setAttribute('data-theme', settings.theme);
}

// Apply on every change
_settings.subscribe((s) => {
  saveToStorage(s);
  applyCssVariables(s);
});

// ─── Public API ───────────────────────────────────────────────────────────────

export const readerSettings = {
  subscribe: _settings.subscribe,

  setFontFamily(fontFamily: FontFamily): void {
    const prev = get(_settings).fontFamily;
    if (prev === fontFamily) return;
    log.info('Font family changed', { from: prev, to: fontFamily });
    _settings.update((s) => ({ ...s, fontFamily }));
  },

  increaseFontSize(): void {
    const prev = get(_settings).fontSizeStep;
    const next = Math.min(prev + 1, FONT_SIZE_STEPS.length - 1);
    if (prev === next) return;
    log.info('Font size increased', {
      fromStep: prev,
      toStep: next,
      fromRem: FONT_SIZE_STEPS[prev],
      toRem: FONT_SIZE_STEPS[next],
    });
    _settings.update((s) => ({ ...s, fontSizeStep: next }));
  },

  decreaseFontSize(): void {
    const prev = get(_settings).fontSizeStep;
    const next = Math.max(prev - 1, 0);
    if (prev === next) return;
    log.info('Font size decreased', {
      fromStep: prev,
      toStep: next,
      fromRem: FONT_SIZE_STEPS[prev],
      toRem: FONT_SIZE_STEPS[next],
    });
    _settings.update((s) => ({ ...s, fontSizeStep: next }));
  },

  setTheme(theme: Theme): void {
    const prev = get(_settings).theme;
    if (prev === theme) return;
    log.info('Theme changed', { from: prev, to: theme });
    _settings.update((s) => ({ ...s, theme }));
  },

  reset(): void {
    log.info('Settings reset to defaults');
    _settings.set({ ...DEFAULT_SETTINGS });
  },
};
