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
exports.CouchDbClient = void 0;
const common_1 = require("@nestjs/common");
let CouchDbClient = class CouchDbClient {
    constructor() {
        const url = process.env.COUCHDB_URL;
        const user = process.env.COUCHDB_USER;
        const pass = process.env.COUCHDB_PASSWORD;
        if (!url || !user || !pass) {
            throw new Error('Missing CouchDB environment variables');
        }
        this.baseUrl = url;
        this.username = user;
        this.password = pass;
    }
    async request(path, options = {}) {
        const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        const res = await fetch(`${this.baseUrl}/${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
                ...(options.headers || {}),
            },
        });
        if (!res.ok) {
            const error = await res.text();
            throw new common_1.HttpException(`CouchDB error: ${error}`, res.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return res.json();
    }
    async get(db, id) {
        return this.request(`${db}/${id}`);
    }
    async put(db, doc) {
        return this.request(`${db}/${doc._id}`, {
            method: 'PUT',
            body: JSON.stringify(doc),
        });
    }
    async query(db, view, params) {
        const queryString = params
            ? `?${new URLSearchParams(params).toString()}`
            : '';
        return this.request(`${db}/_design/${view}/_view/${view}${queryString}`);
    }
};
exports.CouchDbClient = CouchDbClient;
exports.CouchDbClient = CouchDbClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CouchDbClient);
//# sourceMappingURL=couchdb.client.js.map