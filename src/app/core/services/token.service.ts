import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';
import { UserIdentity } from '../models/auth/user-identity';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly platformId = inject(PLATFORM_ID);

  private readonly TOKEN_KEY = 'auth_token';

  private readonly ROLE_KEY = 'user_role';

  private readonly USERNAME_KEY = 'user_name';

  private readonly USER_EMAIL_KEY = 'user_email';

  private readonly USER_ID_KEY = 'user_id';

  private readonly USER_IDENTITY_KEY = 'user_identity';

  private readonly SOCIAL_LOGIN_KEY = 'is_social_login';

  /* ---------------------------------------------------------- */

  private readonly token = signal<string | null>(
    this.readFromStorage(this.TOKEN_KEY)
  );

  private readonly role = signal<string | null>(
    this.readFromStorage(this.ROLE_KEY)
  );

  private readonly userName = signal<string | null>(
    this.readFromStorage(this.USERNAME_KEY)
  );

  private readonly userEmail = signal<string | null>(
    this.readFromStorage(this.USER_EMAIL_KEY)
  );

  private readonly userId = signal<number | null>(this.readUserId());

  private readonly socialLogin = signal(this.readFromStorage(this.SOCIAL_LOGIN_KEY) === 'true');

  /* Reactive state ------------------------------------------- */

  readonly hasToken = computed(() => this.token() !== null);

  readonly currentToken = this.token.asReadonly();

  readonly currentRole = this.role.asReadonly();

  readonly currentUserName = this.userName.asReadonly();

  readonly currentUserEmail = this.userEmail.asReadonly();

  readonly currentUserId = this.userId.asReadonly();

  readonly isSocialLogin = this.socialLogin.asReadonly();

  /* ---------------------------------------------------------- */

  private readFromStorage(key: string): string | null {

    if (!this.isBrowser()) {

      return null;

    }

    return localStorage.getItem(key);

  }

  private isBrowser(): boolean {

    return isPlatformBrowser(this.platformId);

  }

  private readUserId(): number | null {
    const value = this.readFromStorage(this.USER_ID_KEY);
    const id = value === null ? NaN : Number(value);
    return Number.isInteger(id) ? id : null;
  }

  /* ---------------------------------------------------------- */

  saveToken(token: string): void {

    if (this.isBrowser()) {

      localStorage.setItem(this.TOKEN_KEY, token);

    }

    this.token.set(token);

  }

  getToken(): string | null {

    return this.token();

  }

  /* ---------------------------------------------------------- */

  saveRole(role: string): void {

    if (this.isBrowser()) {

      localStorage.setItem(this.ROLE_KEY, role);

    }

    this.role.set(role);

  }

  getRole(): string | null {

    return this.role();

  }

  /* ---------------------------------------------------------- */

  saveUserName(name: string): void {

    if (this.isBrowser()) {

      localStorage.setItem(this.USERNAME_KEY, name);

    }

    this.userName.set(name);

  }

  getUserName(): string | null {

    return this.userName();

  }

  saveUserEmail(email: string): void {
    if (this.isBrowser()) localStorage.setItem(this.USER_EMAIL_KEY, email);
    this.userEmail.set(email);
  }

  getUserEmail(): string | null { return this.userEmail(); }

  saveUserId(id: number): void {
    if (this.isBrowser()) localStorage.setItem(this.USER_ID_KEY, String(id));
    this.userId.set(id);
  }

  getUserId(): number | null { return this.userId(); }

  saveSocialLogin(isSocialLogin: boolean): void {
    if (this.isBrowser()) localStorage.setItem(this.SOCIAL_LOGIN_KEY, String(isSocialLogin));
    this.socialLogin.set(isSocialLogin);
  }

  saveUserIdentity(identity: UserIdentity): void {
    if (this.isBrowser()) localStorage.setItem(this.USER_IDENTITY_KEY, JSON.stringify(identity));
    this.saveToken(identity.token);
    this.saveRole(identity.role);
    this.saveUserName(identity.userName);
    this.saveUserEmail(identity.email);
    this.saveUserId(identity.userId);
  }

  getUserIdentity(): UserIdentity | null {
    if (!this.isBrowser()) return null;
    const value = localStorage.getItem(this.USER_IDENTITY_KEY);
    if (!value) return null;
    try { return JSON.parse(value) as UserIdentity; } catch { return null; }
  }

  /* ---------------------------------------------------------- */

  getAccessToken(): string | null {

    return this.getToken();

  }

  hasAccessToken(): boolean {

    return this.hasToken();

  }

  /* ---------------------------------------------------------- */

  clear(): void {

    if (this.isBrowser()) {

      localStorage.removeItem(this.TOKEN_KEY);

      localStorage.removeItem(this.ROLE_KEY);

      localStorage.removeItem(this.USERNAME_KEY);

      localStorage.removeItem(this.USER_EMAIL_KEY);

      localStorage.removeItem(this.USER_ID_KEY);

      localStorage.removeItem(this.USER_IDENTITY_KEY);

      localStorage.removeItem(this.SOCIAL_LOGIN_KEY);

    }

    this.token.set(null);

    this.role.set(null);

    this.userName.set(null);

    this.userEmail.set(null);

    this.userId.set(null);

    this.socialLogin.set(false);

  }

}
