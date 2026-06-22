import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/application/users.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // -------------------------
  // REGISTER
  // -------------------------
  async register(email: string, password: string) {
    const user = await this.usersService.createUser({
      email,
      password,
    });

    return {
      success: true,
      user,
    };
  }

  // -------------------------
  // LOGIN
  // -------------------------
  async login(
    email: string,
    password: string,
    userAgent: string,
    ip: string,
  ) {
    const user = await this.usersService.findByEmail(email);

    // console.log('LOGIN EMAIL:', email);
    // console.log('FOUND USER:', user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid =
      await this.usersService.verifyPassword(user, password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // -------------------------
    // SESSION (simplified MVP logic)
    // -------------------------
    const sessionId = crypto.randomUUID();
    const refreshToken = crypto.randomBytes(64).toString('hex');

    const accessToken = this.generateAccessToken(
      user.id,
      sessionId,
    );

    // NOTE:
    // session storage will be implemented in SessionsModule later
    // for now we assume it's handled elsewhere or TODO

    return {
      user,
      sessionId,
      refreshToken,
      accessToken,
    };
  }

  // -------------------------
  // REFRESH
  // -------------------------
  async refresh(cookie: string) {
    if (!cookie) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const [sessionId, refreshToken] = cookie.split(':');

    if (!sessionId || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // TODO: validate session in SessionsModule (next step)
    const newAccessToken = this.generateAccessToken(
      'user-id-placeholder',
      sessionId,
    );

    const newRefreshToken =
      crypto.randomBytes(64).toString('hex');

    return {
      sessionId,
      refreshToken: newRefreshToken,
      accessToken: newAccessToken,
    };
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  async logout(cookie: string) {
    if (!cookie) return;

    const [sessionId] = cookie.split(':');

    // TODO: revoke session in SessionsModule

    return {
      success: true,
      sessionId,
    };
  }

  // -------------------------
  // JWT (ACCESS TOKEN)
  // -------------------------
  private generateAccessToken(
    userId: string,
    sessionId: string,
  ) {
    // MVP SIMPLE TOKEN (NOT FULL JWT YET)
    // later we replace with real JWT module

    const payload = {
      sub: userId,
      sid: sessionId,
      iat: Date.now(),
    };

    return Buffer.from(JSON.stringify(payload)).toString(
      'base64',
    );
  }
}