import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Theme } from '@pathforge/shared-enums';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme as 'light' | 'dark';
}

function applyTheme(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system' as Theme,
      resolvedTheme: 'light',

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },

      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next as Theme, resolvedTheme: next });
      },
    }),
    {
      name: 'pathforge-theme',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          applyTheme(resolved);
          state.resolvedTheme = resolved;
        }
      },
    },
  ),
);
