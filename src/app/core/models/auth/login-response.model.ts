import { AuthUser } from './auth-user.model';

export interface LoginResponse {

  accessToken: string;

  refreshToken: string;

  user: AuthUser;

}