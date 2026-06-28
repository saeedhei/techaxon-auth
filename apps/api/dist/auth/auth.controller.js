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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const jwt = require("jsonwebtoken");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    setCookie(res, sessionId, refreshToken) {
        res.cookie("techaxon_refresh_token", `${sessionId}:${refreshToken}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            domain: process.env.COOKIE_DOMAIN || ".techaxon.localhost",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    async register(dto) {
        return this.authService.register(dto.username, dto.password);
    }
    async login(dto, req, res) {
        const userAgent = req.headers["user-agent"] || "Unknown";
        const ip = req.headers["x-forwarded-for"] || req.ip || "Unknown";
        const result = await this.authService.login(dto.username, dto.password, "Codespace Terminal", userAgent, ip);
        this.setCookie(res, result.sessionId, result.refreshToken);
        return {
            success: true,
            accessToken: result.accessToken,
            user: { id: result.userId, username: result.username },
        };
    }
    async refresh(req, res) {
        const cookie = req.cookies["techaxon_refresh_token"];
        const result = await this.authService.refresh(cookie);
        this.setCookie(res, result.sessionId, result.refreshToken);
        return { success: true, accessToken: result.accessToken };
    }
    async logout(req, res) {
        const cookie = req.cookies["techaxon_refresh_token"];
        if (cookie) {
            await this.authService.logout(cookie);
        }
        res.clearCookie("techaxon_refresh_token", {
            domain: process.env.COOKIE_DOMAIN || ".techaxon.localhost",
            path: "/",
        });
        return { success: true, message: "Logged out successfully" };
    }
    async getMe(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { success: false, isAuthenticated: false, user: null };
        }
        const token = authHeader.split(" ")[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access123");
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
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("register"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)("login"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Get("me"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("api/auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map