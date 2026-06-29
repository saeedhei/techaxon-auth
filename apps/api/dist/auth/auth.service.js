"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_interface_1 = require("../database/user-repository.interface");
const couchdb_service_1 = require("../database/couchdb.service");
const redis_service_1 = require("../database/redis.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(userRepo, couchDb, redis) {
        this.userRepo = userRepo;
        this.couchDb = couchDb;
        this.redis = redis;
    }
    getAccessSecret() {
        return process.env.JWT_ACCESS_SECRET || "access123";
    }
    getRefreshSecret() {
        return process.env.JWT_REFRESH_SECRET || "refresh123";
    }
    async register(username, pass) {
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
    async login(username, pass, deviceInfo = "Unknown Device", userAgent = "Unknown", ip = "Unknown") {
        const user = await this.userRepo.findByUsername(username);
        if (!user || !(await bcrypt.compare(pass, user.password))) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const accessToken = jwt.sign({ userId: user._id, username: user.username }, this.getAccessSecret(), { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user._id }, this.getRefreshSecret(), { expiresIn: "7d" });
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
        const response = await this.couchDb.db.insert(sessionData);
        sessionData._rev = response.rev;
        const REDIS_SESSION_TTL = 7 * 24 * 60 * 60;
        await this.redis.set(`session:${sessionId}`, JSON.stringify(sessionData), "EX", REDIS_SESSION_TTL);
        return {
            accessToken,
            refreshToken,
            sessionId,
            userId: user._id,
            username: user.username,
        };
    }
    async refresh(cookieValue) {
        const [sessionId, rawRefreshToken] = cookieValue.split(":");
        if (!sessionId || !rawRefreshToken)
            throw new common_1.UnauthorizedException("Invalid token format");
        let payload;
        try {
            payload = jwt.verify(rawRefreshToken, this.getRefreshSecret());
        }
        catch {
            throw new common_1.UnauthorizedException("Token expired or invalid");
        }
        let sessionData;
        const cachedSession = await this.redis.get(`session:${sessionId}`);
        if (cachedSession) {
            sessionData = JSON.parse(cachedSession);
        }
        else {
            try {
                sessionData = await this.couchDb.db.get(sessionId);
            }
            catch {
                throw new common_1.UnauthorizedException("Session not found");
            }
        }
        if (!sessionData || !sessionData.isValid) {
            throw new common_1.UnauthorizedException("Session revoked");
        }
        const isTokenValid = await bcrypt.compare(rawRefreshToken, sessionData.hashedRefreshToken);
        if (!isTokenValid) {
            sessionData.isValid = false;
            await this.couchDb.db.insert(sessionData);
            await this.redis.del(`session:${sessionId}`);
            throw new common_1.ForbiddenException("Security breach detected. Session revoked.");
        }
        const newAccessToken = jwt.sign({ userId: sessionData.userId, username: payload.username }, this.getAccessSecret(), { expiresIn: "15m" });
        const newRefreshToken = jwt.sign({ userId: sessionData.userId }, this.getRefreshSecret(), { expiresIn: "7d" });
        const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
        const updatedSession = {
            ...sessionData,
            hashedRefreshToken: newHashedRefreshToken,
            updatedAt: new Date().toISOString(),
        };
        const response = await this.couchDb.db.insert(updatedSession);
        updatedSession._rev = response.rev;
        const REDIS_SESSION_TTL = 7 * 24 * 60 * 60;
        await this.redis.set(`session:${sessionId}`, JSON.stringify(updatedSession), "EX", REDIS_SESSION_TTL);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            sessionId,
        };
    }
    async logout(cookieValue) {
        const [sessionId] = cookieValue.split(":");
        if (sessionId) {
            await this.redis.del(`session:${sessionId}`);
            try {
                const sessionData = await this.couchDb.db.get(sessionId);
                sessionData.isValid = false;
                await this.couchDb.db.insert(sessionData);
            }
            catch { }
        }
    }
    async verifyAccessToken(token) {
        try {
            const payload = jwt.verify(token, this.getAccessSecret());
            return {
                success: true,
                isAuthenticated: true,
                user: {
                    id: payload.userId,
                    username: payload.username,
                },
            };
        }
        catch (error) {
            return { success: false, isAuthenticated: false, user: null };
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_interface_1.UserRepository,
        couchdb_service_1.CouchDbService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map