import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type AppLanguage = 'en' | 'hi';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly language = signal<AppLanguage>('en');

  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.document.documentElement.lang = this.language();
      return;
    }

    const savedLanguage = localStorage.getItem('language');
    this.setLanguage(savedLanguage === 'hi' ? 'hi' : 'en');
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    this.document.documentElement.lang = language;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', language);
    }
  }

  text(english: string, hindi: string): string {
    return this.language() === 'hi' ? hindi : english;
  }
}
