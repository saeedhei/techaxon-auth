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
const users_service_1 = require("../users/application/users.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async register(email, password) {
        const user = await this.usersService.createUser({
            email,
            password,
        });
        return {
            success: true,
            user,
        };
    }
    async login(email, password, userAgent, ip) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await this.usersService.verifyPassword(user, password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const sessionId = crypto.randomUUID();
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const accessToken = this.generateAccessToken(user.id, sessionId);
        return {
            user,
            sessionId,
            refreshToken,
            accessToken,
        };
    }
    async refresh(cookie) {
        if (!cookie) {
            throw new common_1.UnauthorizedException('Missing refresh token');
        }
        const [sessionId, refreshToken] = cookie.split(':');
        if (!sessionId || !refreshToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const newAccessToken = this.generateAccessToken('user-id-placeholder', sessionId);
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        return {
            sessionId,
            refreshToken: newRefreshToken,
            accessToken: newAccessToken,
        };
    }
    async logout(cookie) {
        if (!cookie)
            return;
        const [sessionId] = cookie.split(':');
        return {
            success: true,
            sessionId,
        };
    }
    generateAccessToken(userId, sessionId) {
        const payload = {
            sub: userId,
            sid: sessionId,
            iat: Date.now(),
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map