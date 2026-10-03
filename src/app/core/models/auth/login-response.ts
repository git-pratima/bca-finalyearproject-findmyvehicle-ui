import { UserIdentity } from './user-identity';
import { Status } from './status';

export interface LoginResponse {

    userIdentity: UserIdentity;

    status: Status;

}