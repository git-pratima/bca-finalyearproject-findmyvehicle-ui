import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';

import {
  DOCUMENT,
  isPlatformBrowser
} from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly document = inject(DOCUMENT);

  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<ThemeMode>('light');

  initialize(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light');
    }

  }

  toggleTheme(): void {

    this.setTheme(
      this.theme() === 'light'
        ? 'dark'
        : 'light'
    );

  }

setTheme(theme: ThemeMode): void {

  this.theme.set(theme);

  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  // Your custom theme
  this.document.documentElement.setAttribute(
    'data-theme',
    theme
  );

  // Angular Material theme
  this.document.documentElement.style.colorScheme = theme;

  localStorage.setItem('theme', theme);

}

}