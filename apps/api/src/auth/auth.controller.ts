import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookie(res: Response, sessionId: string, refreshToken: string) {
    res.cookie("techaxon_refresh_token", `${sessionId}:${refreshToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN || ".techaxon.localhost",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  @Post("register")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async login(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip =
      (req.headers["x-forwarded-for"] as string) || req.ip || "Unknown";

    const result = await this.authService.login(
      dto.username,
      dto.password,
      "Codespace Terminal",
      userAgent,
      ip,
    );
    this.setCookie(res, result.sessionId, result.refreshToken);

    return {
      success: true,
      accessToken: result.accessToken,
      user: { id: result.userId, username: result.username },
    };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies["techaxon_refresh_token"];
    const result = await this.authService.refresh(cookie);
    this.setCookie(res, result.sessionId, result.refreshToken);

    return { success: true, accessToken: result.accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies["techaxon_refresh_token"];
    if (cookie) {
      await this.authService.logout(cookie);
    }
    res.clearCookie("techaxon_refresh_token", {
      domain: process.env.COOKIE_DOMAIN || ".techaxon.localhost",
      path: "/",
    });
    return { success: true, message: "Logged out successfully" };
  }
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, isAuthenticated: false, user: null };
    }

    const token = authHeader.split(" ")[1];

    // 🔌 Clean & Decoupled: Hand it to the Service Chef!
    return this.authService.verifyAccessToken(token);
  }
}
