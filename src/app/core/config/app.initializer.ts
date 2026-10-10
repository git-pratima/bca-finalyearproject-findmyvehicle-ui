import { inject } from '@angular/core';

import { ConfigService } from '../services/config.service';
import { LanguageService } from '../services/language.service';
import { ThemeService } from '../services/theme.service';

export function initializeApp(): () => Promise<void> {

  return async () => {

    const configService = inject(ConfigService);

    const themeService = inject(ThemeService);
    const languageService = inject(LanguageService);

    themeService.initialize();
    languageService.initialize();

    await configService.loadConfig();

  };

}