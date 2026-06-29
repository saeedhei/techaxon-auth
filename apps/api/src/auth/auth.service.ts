import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { UserRepository } from "../database/user-repository.interface";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionService: SessionService, // Injecting Session Helper
    private readonly tokenService: TokenService, // Injecting Token Helper
  ) {}

  async register(username: string, pass: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = {
      type: "user",
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    const response = await this.userRepo.createUser(newUser);
    return { success: true, id: response.id };
  }

  async login(
    username: string,
    pass: string,
    deviceInfo = "Unknown Device",
    userAgent = "Unknown",
    ip = "Unknown",
  ) {
    // 1. Verify User Credentials
    const user = await this.userRepo.findByUsername(username);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // 2. Generate access and refresh tokens
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const sessionId = crypto.randomUUID();

    const sessionData = {
      _id: sessionId,
      type: "session",
      userId: user._id,
      hashedRefreshToken,
      deviceInfo,
      userAgent,
      ip,
      createdAt: new Date().toISOString(),
      isValid: true,
    };

    // 3. Delegate Session Creation to SessionService!
    await this.sessionService.createSession(sessionId, sessionData);

    return {
      accessToken,
      refreshToken,
      sessionId,
      userId: user._id,
      username: user.username,
    };
  }

  async refresh(cookieValue: string) {
    if (!cookieValue)
      throw new UnauthorizedException("No refresh token provided");

    const [sessionId, rawRefreshToken] = cookieValue.split(":");
    if (!sessionId || !rawRefreshToken)
      throw new UnauthorizedException("Invalid token format");

    // 1. Verify Token signature via TokenService
    const payload = this.tokenService.verifyRefreshToken(rawRefreshToken);

    // 2. Fetch Session via SessionService
    const sessionData = await this.sessionService.getSession(sessionId);

    if (!sessionData || !sessionData.isValid) {
      throw new UnauthorizedException("Session revoked");
    }

    // 3. Verify Token Hash matches database
    const isTokenValid = await bcrypt.compare(
      rawRefreshToken,
      sessionData.hashedRefreshToken,
    );
    if (!isTokenValid) {
      await this.sessionService.revokeSession(sessionId);
      throw new ForbiddenException(
        "Security breach detected. Session revoked.",
      );
    }

    // 4. Rotate Tokens
    const newAccessToken = this.tokenService.generateAccessToken({
      _id: sessionData.userId,
      username: payload.username,
    });
    const newRefreshToken = this.tokenService.generateRefreshToken({
      _id: sessionData.userId,
    });

    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    const updatedSession = {
      ...sessionData,
      hashedRefreshToken: newHashedRefreshToken,
      updatedAt: new Date().toISOString(),
    };

    // 5. Update Session via SessionService
    await this.sessionService.updateSession(sessionId, updatedSession);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId,
    };
  }

  async logout(cookieValue: string) {
    if (!cookieValue) return;
    const [sessionId] = cookieValue.split(":");
    if (sessionId) {
      // Delegate logout to SessionService
      await this.sessionService.revokeSession(sessionId);
    }
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = this.tokenService.verifyAccessToken(token);
      return {
        success: true,
        isAuthenticated: true,
        user: { id: payload.userId, username: payload.username },
      };
    } catch {
      return { success: false, isAuthenticated: false, user: null };
    }
  }
}
