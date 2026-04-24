import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from './theme.service';

export type Language = 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private languageSubject = new BehaviorSubject<Language>('en');
  language$ = this.languageSubject.asObservable();

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService
  ) {
    this.loadSettings();
  }

  private loadSettings() {
    const savedLang = localStorage.getItem('language') as Language;
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = (savedLang && (savedLang === 'en' || savedLang === 'fr')) 
      ? savedLang 
      : (browserLang?.match(/en|fr/) ? browserLang : 'en');
    
    this.setLanguage(defaultLang as Language);
  }

  setLanguage(lang: Language) {
    this.translate.use(lang);
    this.languageSubject.next(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLanguage(): Language {
    return this.languageSubject.value;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

   isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}