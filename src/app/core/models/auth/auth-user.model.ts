import { Role } from './role.model';

export interface AuthUser {

  id: number;

  fullName: string;

  email: string;

  profilePicture?: string;

  roles: Role[];

}