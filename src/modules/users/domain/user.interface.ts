export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  type: 'user';

  email: string;
  emailNormalized: string;

  passwordHash: string;

  emailVerified: boolean;

  status: UserStatus;

  createdAt: string;
  updatedAt: string;
}