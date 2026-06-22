import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule, // 👈 برای login/register (user lookup + password check)
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}