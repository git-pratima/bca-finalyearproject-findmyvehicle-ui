import { AuthUser } from './auth-user.model';

export interface AuthState {

  authenticated: boolean;

  loading: boolean;

  user: AuthUser | null;

}