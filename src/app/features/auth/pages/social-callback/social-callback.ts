import {
  Component,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-social-callback',
  standalone: true,
  templateUrl: './social-callback.html'
})
export class SocialCallback {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly tokenService = inject(TokenService);

  constructor() {

    this.tokenService.saveSocialLogin(true);

    const token = this.route.snapshot.queryParamMap.get('token');

    const role = this.route.snapshot.queryParamMap.get('role');

    const username = this.route.snapshot.queryParamMap.get('username');

    const userId = this.route.snapshot.queryParamMap.get('userId');

    if (token) {
      this.tokenService.saveToken(token);
    }

    if (role) {
      this.tokenService.saveRole(role);
    }

    if (username) {
      this.tokenService.saveUserName(username);
    }

    const parsedUserId = userId === null ? NaN : Number(userId);

    if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
      this.tokenService.saveUserId(parsedUserId);
    }

   setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 100);

  }

}
