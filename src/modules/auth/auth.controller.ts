import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Request, Response } from 'express';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -------------------------
  // COOKIE HELPER (TRANSPORT ONLY)
  // -------------------------
  private setRefreshCookie(
    res: Response,
    sessionId: string,
    refreshToken: string,
  ) {
    res.cookie('refresh_token', `${sessionId}:${refreshToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  // -------------------------
  // REGISTER
  // -------------------------
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  // -------------------------
  // LOGIN
  // -------------------------
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      'unknown';

    const result = await this.authService.login(
      dto.email,
      dto.password,
      userAgent,
      ip,
    );

    this.setRefreshCookie(
      res,
      result.sessionId,
      result.refreshToken,
    );

    return {
      success: true,
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    };
  }

  // -------------------------
  // REFRESH TOKEN
  // -------------------------
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies?.refresh_token;

    const result = await this.authService.refresh(cookie);

    this.setRefreshCookie(
      res,
      result.sessionId,
      result.refreshToken,
    );

    return {
      success: true,
      accessToken: result.accessToken,
    };
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies?.refresh_token;

    if (cookie) {
      await this.authService.logout(cookie);
    }

    res.clearCookie('refresh_token', {
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
    });

    return {
      success: true,
    };
  }
}