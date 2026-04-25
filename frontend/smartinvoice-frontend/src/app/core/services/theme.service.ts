import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = signal<boolean>(false);
  readonly isDarkMode = this.darkMode.asReadonly();

  constructor() {
    this.initTheme();
    effect(() => {
      const isDark = this.darkMode();
      document.body.classList.toggle('dark-mode', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  private initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.darkMode.set(true);
    } else if (saved === 'light') {
      this.darkMode.set(false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(prefersDark);
    }
  }

  toggleTheme(): void {
    this.darkMode.update(dark => !dark);
  }

  enableDarkMode(): void {
    this.darkMode.set(true);
  }

  disableDarkMode(): void {
    this.darkMode.set(false);
  }
}