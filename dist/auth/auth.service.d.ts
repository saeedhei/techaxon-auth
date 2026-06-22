import { UserRepository } from "../database/user-repository.interface";
import { CouchDbService } from "../database/couchdb.service";
import { RedisService } from "../database/redis.service";
export declare class AuthService {
    private readonly userRepo;
    private readonly couchDb;
    private readonly redis;
    constructor(userRepo: UserRepository, couchDb: CouchDbService, redis: RedisService);
    private getAccessSecret;
    private getRefreshSecret;
    register(username: string, pass: string): Promise<{
        success: boolean;
        id: any;
    }>;
    login(username: string, pass: string, deviceInfo?: string, userAgent?: string, ip?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        userId: any;
        username: any;
    }>;
    refresh(cookieValue: string): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
    }>;
    logout(cookieValue: string): Promise<void>;
}
