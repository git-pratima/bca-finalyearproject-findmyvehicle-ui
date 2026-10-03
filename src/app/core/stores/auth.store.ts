import { Injectable, computed, signal } from '@angular/core';

import { AuthState } from '../models/auth/auth-state.model';
import { AuthUser } from '../models/auth/auth-user.model';
import { Role } from '../models/auth/role.model';

const INITIAL_STATE: AuthState = {
  authenticated: false,
  loading: false,
  user: null
};

@Injectable({
  providedIn: 'root'
})
export class AuthStore {

  private readonly state = signal<AuthState>(INITIAL_STATE);

  readonly authenticated = computed(() => this.state().authenticated);

  readonly loading = computed(() => this.state().loading);

  readonly user = computed(() => this.state().user);

  readonly isAdmin = computed(() =>
    this.state().user?.roles.includes(Role.ADMIN) ?? false
  );

  readonly isUser = computed(() =>
    this.state().user?.roles.includes(Role.USER) ?? false
  );

  setLoading(loading: boolean): void {

    this.state.update(state => ({
      ...state,
      loading
    }));

  }

  login(user: AuthUser): void {

    this.state.set({
      authenticated: true,
      loading: false,
      user
    });

  }

  logout(): void {

    this.state.set(INITIAL_STATE);

  }

}