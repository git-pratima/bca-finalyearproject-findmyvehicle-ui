import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { AppConfig } from '../models/app-config.model';

const DEFAULT_CONFIG: AppConfig = {
  apiUrl: '/api',
  oauthUrl: ''
};

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private readonly http = inject(HttpClient);

  private readonly platformId = inject(PLATFORM_ID);

  private config: AppConfig | null = null;

  async loadConfig(): Promise<void> {

    // Skip runtime configuration during SSR / prerender
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Skipping runtime configuration during SSR.');
      return;
    }

    try {

      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/config/app-config.json')
      );

      console.log('Application configuration loaded successfully.');

    } catch (error) {

      console.error('Failed to load application configuration.', error);

      this.config = DEFAULT_CONFIG;

    }

  }

get apiUrl(): string {

  if (!isPlatformBrowser(this.platformId)) {
    return DEFAULT_CONFIG.apiUrl;
  }

  return window.location.hostname === 'localhost'
    ? '/api'
    : 'https://findmyvehicle.onrender.com/api';

}

get oauthUrl(): string {

  if (!isPlatformBrowser(this.platformId)) {
    return DEFAULT_CONFIG.oauthUrl;
  }

  return window.location.hostname === 'localhost'
    ? ''
    : 'https://findmyvehicle.onrender.com';

}

  get configuration(): AppConfig {
    return this.config ?? DEFAULT_CONFIG;
  }

}