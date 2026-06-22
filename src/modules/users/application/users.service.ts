import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';

import { IUserRepository, USER_REPOSITORY } from '../domain/user.repository';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

export interface CreateUserInput {
  email: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  // -------------------------
  // CREATE USER (REGISTER CORE)
  // -------------------------
  async createUser(input: CreateUserInput) {
    const emailNormalized = input.email.trim().toLowerCase();

    const existingUser =
      await this.userRepository.findByEmail(emailNormalized);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await argon2.hash(input.password);

    const now = new Date().toISOString();

    const user = {
      id: randomUUID(),
      type: 'user' as const,

      email: input.email,
      emailNormalized,

      passwordHash,

      emailVerified: false,
      status: 'active' as const,

      createdAt: now,
      updatedAt: now,
    };

    await this.userRepository.create(user);

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  // -------------------------
  // FIND BY EMAIL (LOGIN SUPPORT)
  // -------------------------
  async findByEmail(email: string) {
    const emailNormalized = email.trim().toLowerCase();
    console.log('RAW EMAIL:', email);
    console.log('NORMALIZED:', email.trim().toLowerCase());
    return this.userRepository.findByEmail(emailNormalized);
  }

  // -------------------------
  // FIND BY ID
  // -------------------------
  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // -------------------------
  // DISABLE USER
  // -------------------------
  async disableUser(id: string) {
    const user = await this.findById(id);

    const updated = {
      ...user,
      status: 'disabled' as const,
      updatedAt: new Date().toISOString(),
    };

    await this.userRepository.update(updated);

    return {
      success: true,
    };
  }

  // -------------------------
  // PASSWORD VERIFY (LOGIN SUPPORT)
  // -------------------------
  async verifyPassword(user: any, password: string) {
    return argon2.verify(user.passwordHash, password);
  }
}