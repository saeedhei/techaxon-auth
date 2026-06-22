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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../domain/user.repository");
const argon2 = require("argon2");
const crypto_1 = require("crypto");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(input) {
        const emailNormalized = input.email.trim().toLowerCase();
        const existingUser = await this.userRepository.findByEmail(emailNormalized);
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const passwordHash = await argon2.hash(input.password);
        const now = new Date().toISOString();
        const user = {
            id: (0, crypto_1.randomUUID)(),
            type: 'user',
            email: input.email,
            emailNormalized,
            passwordHash,
            emailVerified: false,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        };
        await this.userRepository.create(user);
        return {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            status: user.status,
            createdAt: user.createdAt,
        };
    }
    async findByEmail(email) {
        const emailNormalized = email.trim().toLowerCase();
        console.log('RAW EMAIL:', email);
        console.log('NORMALIZED:', email.trim().toLowerCase());
        return this.userRepository.findByEmail(emailNormalized);
    }
    async findById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async disableUser(id) {
        const user = await this.findById(id);
        const updated = {
            ...user,
            status: 'disabled',
            updatedAt: new Date().toISOString(),
        };
        await this.userRepository.update(updated);
        return {
            success: true,
        };
    }
    async verifyPassword(user, password) {
        return argon2.verify(user.passwordHash, password);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=users.service.js.map