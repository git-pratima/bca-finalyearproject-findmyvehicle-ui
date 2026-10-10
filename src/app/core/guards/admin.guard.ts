import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../services/token.service';

export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true;

  const tokenService = inject(TokenService);
  const router = inject(Router);
  tokenService.refreshRole();
  return tokenService.isAdmin()
    ? true
    : router.createUrlTree(['/dashboard']);
};
