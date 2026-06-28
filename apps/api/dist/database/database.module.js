"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const couchdb_service_1 = require("./couchdb.service");
const redis_service_1 = require("./redis.service");
const user_repository_interface_1 = require("./user-repository.interface");
const couchdb_user_repository_1 = require("./couchdb-user.repository");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            couchdb_service_1.CouchDbService,
            redis_service_1.RedisService,
            {
                provide: user_repository_interface_1.UserRepository,
                useClass: couchdb_user_repository_1.CouchDbUserRepository,
            },
        ],
        exports: [couchdb_service_1.CouchDbService, redis_service_1.RedisService, user_repository_interface_1.UserRepository],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map