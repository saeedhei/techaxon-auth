import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class TokenService {
  private getAccessSecret(): string {
    return process.env.JWT_ACCESS_SECRET || "access123";
  }

  private getRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET || "refresh123";
  }

  // Signs the 15-minute Access Token
  generateAccessToken(user: any): string {
    return jwt.sign(
      { userId: user._id, username: user.username },
      this.getAccessSecret(),
      { expiresIn: "15m" },
    );
  }

  // Signs the 7-day Refresh Token
  generateRefreshToken(user: any): string {
    return jwt.sign({ userId: user._id }, this.getRefreshSecret(), {
      expiresIn: "7d",
    });
  }

  // Verifies the signature of the Refresh Token
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.getRefreshSecret());
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  // Verifies the signature of the Access Token
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.getAccessSecret());
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }
}
