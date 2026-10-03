import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { ConfigService } from './config.service';
import { TokenService } from './token.service';

import { LoginResponse } from '../models/auth/login-response';

import { RegisterRequest } from '../models/auth/register-request';
import { RegisterResponse } from '../models/auth/register-response';
import { LoginRequest } from '../models/auth/login-request';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  status: { status: number; message: string; };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly config = inject(ConfigService);

  private readonly tokenService = inject(TokenService);

  private get api(): string {

    return this.config.apiUrl;

  }

  register(request: RegisterRequest): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.api}/auth/register`,
      request
    );

  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.api}/auth/login`,
      request
    ).pipe(
      tap(response => {
        if (response.status?.status < 200 || response.status?.status >= 300) {
          return;
        }

        this.tokenService.saveSocialLogin(false);
        this.tokenService.saveUserIdentity(response.userIdentity);

      })

    );

  }

  changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${this.api}/auth/change-password`, request);
  }

  logout(): void {

    this.tokenService.clear();

  }

  isLoggedIn(): boolean {

    return this.tokenService.hasAccessToken();

  }

}
