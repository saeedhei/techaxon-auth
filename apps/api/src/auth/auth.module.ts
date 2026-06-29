import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SessionService } from "./session.service"; // Import
import { TokenService } from "./token.service"; // Import

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionService, TokenService], // Add both here!
})
export class AuthModule {}
