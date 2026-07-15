import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { UserRepository } from '../users/user.repository';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(dto: RegisterDto) {
    // 1. Check if email already exists!
    const existingUser = await this.userRepo.findByEmail(dto.email);

    if (existingUser) {
      // Throw the HTTP 409 Conflict Saeed asked for!
      throw new ConflictException('A user with this email already exists');
    }

    // 2. If it doesn't exist, proceed with creation
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const now = new Date().toISOString();

    const newUser = {
      type: 'user' as const,
      username: dto.username,
      email: dto.email,
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
  }
}
