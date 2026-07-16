import { BaseDocument } from './base.document';

export interface SessionDocument extends BaseDocument {
  type: 'session';

  userId: string;

  refreshTokenHash: string;

  deviceId?: string;

  ip?: string;

  userAgent?: string;

  expiresAt: string;

  revokedAt?: string;
}
