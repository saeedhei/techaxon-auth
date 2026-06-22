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
exports.CouchDbUserRepository = void 0;
const common_1 = require("@nestjs/common");
const couchdb_client_1 = require("../../../infrastructure/couchdb/couchdb.client");
let CouchDbUserRepository = class CouchDbUserRepository {
    constructor(db) {
        this.db = db;
        this.dbName = 'auth_db';
    }
    async create(user) {
        await this.db.put(this.dbName, {
            _id: `user:${user.id}`,
            type: 'user',
            id: user.id,
            email: user.email,
            emailNormalized: user.emailNormalized,
            passwordHash: user.passwordHash,
            emailVerified: user.emailVerified,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }
    async findById(id) {
        try {
            const doc = await this.db.get(this.dbName, `user:${id}`);
            if (!doc || doc.type !== 'user') {
                return null;
            }
            return this.toDomain(doc);
        }
        catch (err) {
            if (err?.status === 404)
                return null;
            throw err;
        }
    }
    async findByEmail(emailNormalized) {
        try {
            const result = await this.db.query(this.dbName, 'users/by-email', {
                key: emailNormalized,
                include_docs: true,
            });
            const row = result.rows?.[0];
            if (!row?.doc)
                return null;
            return this.toDomain(row.doc);
        }
        catch (err) {
            return null;
        }
    }
    async update(user) {
        const existing = await this.db.get(this.dbName, `user:${user.id}`);
        await this.db.put(this.dbName, {
            ...existing,
            ...user,
            updatedAt: new Date().toISOString(),
        });
    }
    toDomain(doc) {
        return {
            id: doc.id,
            type: doc.type,
            email: doc.email,
            emailNormalized: doc.emailNormalized,
            passwordHash: doc.passwordHash,
            emailVerified: doc.emailVerified,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
};
exports.CouchDbUserRepository = CouchDbUserRepository;
exports.CouchDbUserRepository = CouchDbUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [couchdb_client_1.CouchDbClient])
], CouchDbUserRepository);
//# sourceMappingURL=couchdb-user.repository.js.map