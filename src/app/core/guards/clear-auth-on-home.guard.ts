import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { TokenService } from '../services/token.service';

export const clearAuthOnHomeGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    inject(TokenService).clear();
  }

  return true;
};
