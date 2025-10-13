import { User } from './user.model';

export interface AuthToken {
  token: string;
  expiresAt: Date;
  roles: string[];
}

export interface AuthUser {
  user: User;
  token: AuthToken;
}
