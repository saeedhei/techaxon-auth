import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private setRefreshCookie;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        user: {
            id: `${string}-${string}-${string}-${string}-${string}`;
            email: string;
            emailVerified: boolean;
            status: "active";
            createdAt: string;
        };
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        accessToken: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
    }>;
}
