import {
  inject,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (

  route,
  state

) => {

  const tokenService = inject(TokenService);

  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);

  // The access token is stored in browser local storage. It cannot be read
  // while SSR renders a refresh, so the browser guard performs the check once
  // hydration completes instead of logging a valid user out.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (tokenService.hasAccessToken()) {

    return true;

  }

  return router.createUrlTree(

    ['/login'],

    {

      queryParams: {

        returnUrl: state.url

      }

    }

  );

};
