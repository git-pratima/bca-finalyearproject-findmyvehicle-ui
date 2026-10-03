import { inject } from '@angular/core';

import { ConfigService } from '../services/config.service';
import { ThemeService } from '../services/theme.service';

export function initializeApp(): () => Promise<void> {

  return async () => {

    const configService = inject(ConfigService);

    const themeService = inject(ThemeService);

    themeService.initialize();

    await configService.loadConfig();

  };

}