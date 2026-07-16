export interface CreateUserResult {
  id: string;
  rev: string;
}

export interface CreateUserData {
  type: 'user';

  username?: string;

  email: string;

  passwordHash: string;

  status: 'active' | 'disabled' | 'pending_verification';

  tenantId: string | null;

  emailVerified: boolean;

  createdAt: string;

  updatedAt: string;
}

export abstract class UserRepository {
  abstract createUser(user: CreateUserData): Promise<CreateUserResult>;

  abstract findByEmail(email: string): Promise<CreateUserData | null>;

  abstract claimEmail(email: string, userId: string): Promise<void>;

  abstract releaseEmailClaim(email: string): Promise<void>;
}
