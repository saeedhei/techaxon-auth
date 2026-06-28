import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { Request, Response } from "express";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private setCookie;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        id: any;
    }>;
    login(dto: RegisterDto, req: Request, res: Response): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            id: any;
            username: any;
        };
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        accessToken: string;
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(req: Request): Promise<{
        success: boolean;
        isAuthenticated: boolean;
        user: {
            id: any;
            username: any;
        };
    }>;
}
