import { Injectable, ConflictException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { UserRepository } from '../users/user.repository';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(dto: RegisterDto) {
    /**
     * 1. Normalize email
     *
     * Prevent:
     * Test@Example.com
     * test@example.com
     *
     * from becoming two accounts.
     */
    const email = dto.email.trim().toLowerCase();

    /**
     * 2. Fast duplicate check.
     *
     * This improves user experience.
     *
     * The real protection is claimEmail()
     * because it is atomic in CouchDB.
     */
    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    /**
     * 3. Generate user id before creation.
     *
     * Needed for email claim document.
     */
    const userId = `user:${randomUUID()}`;

    /**
     * 4. Reserve email atomically.
     *
     * If another request already claimed
     * this email, CouchDB throws conflict.
     */
    try {
      await this.userRepo.claimEmail(email, userId);
    } catch {
      throw new ConflictException('A user with this email already exists');
    }

    try {
      /**
       * 5. Hash password
       */
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const now = new Date().toISOString();

      /**
       * 6. Create user document
       */
      const newUser = {
        _id: userId,

        type: 'user' as const,

        username: dto.username,

        email,

        passwordHash,

        status: 'pending_verification' as const,

        emailVerified: false,

        tenantId: null,

        createdAt: now,

        updatedAt: now,
      };

      const response = await this.userRepo.createUser(newUser);

      return {
        success: true,
        id: response.id,
      };
    } catch (error) {
      /**
       * 7. Rollback email claim.
       *
       * Prevent orphan email_claim documents.
       */
      await this.userRepo.releaseEmailClaim(email);

      throw error;
    }
  }
}
