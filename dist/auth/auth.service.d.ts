import { CouchDbService } from '../database/couchdb.service';
import { RedisService } from '../database/redis.service';
export declare class AuthService {
    private readonly couchDb;
    private readonly redis;
    constructor(couchDb: CouchDbService, redis: RedisService);
    private getAccessSecret;
    private getRefreshSecret;
    register(username: string, pass: string): Promise<{
        success: boolean;
        id: string;
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
