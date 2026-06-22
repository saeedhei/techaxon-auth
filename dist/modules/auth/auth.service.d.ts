import { UsersService } from '../users/application/users.service';
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(email: string, password: string): Promise<{
        success: boolean;
        user: {
            id: `${string}-${string}-${string}-${string}-${string}`;
            email: string;
            emailVerified: boolean;
            status: "active";
            createdAt: string;
        };
    }>;
    login(email: string, password: string, userAgent: string, ip: string): Promise<{
        user: import("../users/domain/user.interface").User;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        refreshToken: string;
        accessToken: string;
    }>;
    refresh(cookie: string): Promise<{
        sessionId: string;
        refreshToken: string;
        accessToken: string;
    }>;
    logout(cookie: string): Promise<{
        success: boolean;
        sessionId: string;
    }>;
    private generateAccessToken;
}
