import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CouchDbService } from "../database/couchdb.service";
import { RedisService } from "../database/redis.service";

@Injectable()
export class SessionService {
  constructor(
    private readonly couchDb: CouchDbService,
    private readonly redis: RedisService,
  ) {}

  // 1. Creates a session, gets the CouchDB _rev, and caches it in Redis
  async createSession(sessionId: string, sessionData: any): Promise<void> {
    const response = await this.couchDb.db.insert(sessionData);
    sessionData._rev = response.rev;

    const TTL = 7 * 24 * 60 * 60; // 7 days
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      TTL,
    );
  }

  // 2. Fetches the session (Checks Redis first, falls back to CouchDB)
  async getSession(sessionId: string): Promise<any> {
    const cached = await this.redis.get(`session:${sessionId}`);
    if (cached) return JSON.parse(cached);

    try {
      return await this.couchDb.db.get(sessionId);
    } catch {
      throw new UnauthorizedException("Session not found");
    }
  }

  // 3. Updates an existing session with a new _rev and updates the Redis cache
  async updateSession(sessionId: string, updatedSession: any): Promise<void> {
    const response = await this.couchDb.db.insert(updatedSession);
    updatedSession._rev = response.rev;

    const TTL = 7 * 24 * 60 * 60;
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(updatedSession),
      "EX",
      TTL,
    );
  }

  // 4. Revokes (Disables) a session permanently
  async revokeSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
    try {
      const session = await this.couchDb.db.get(sessionId);
      session.isValid = false;
      await this.couchDb.db.insert(session);
    } catch {}
  }
}
