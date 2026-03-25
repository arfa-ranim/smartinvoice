import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else if (savedTheme === 'light') {
      this.disableDarkMode();
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? this.enableDarkMode() : this.disableDarkMode();
    }
  }

  toggleTheme() {
    if (this.darkModeSubject.value) {
      this.disableDarkMode();
      localStorage.setItem('theme', 'light');
    } else {
      this.enableDarkMode();
      localStorage.setItem('theme', 'dark');
    }
  }

  enableDarkMode() {
    document.body.classList.add('dark-mode');
    this.darkModeSubject.next(true);
  }

  disableDarkMode() {
    document.body.classList.remove('dark-mode');
    this.darkModeSubject.next(false);
  }
}