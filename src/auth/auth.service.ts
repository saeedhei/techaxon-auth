import { Injectable } from '@nestjs/common';
import { UserRepository } from '../database/user-repository.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(username: string, pass: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = {
      type: 'user',
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const response = await this.userRepo.createUser(newUser);
    return { success: true, id: response.id };
  }
}
