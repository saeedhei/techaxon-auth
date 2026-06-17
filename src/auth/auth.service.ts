import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CouchDbService } from '../database/couchdb.service';
import { RedisService } from '../database/redis.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly couchDb: CouchDbService,
    private readonly redis: RedisService,
  ) {}

  private getAccessSecret() { return process.env.JWT_ACCESS_SECRET || 'access123'; }
  private getRefreshSecret() { return process.env.JWT_REFRESH_SECRET || 'refresh123'; }

  async register(username: string, pass: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = {
      type: 'user',
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    const response = await this.couchDb.db.insert(newUser);
    return { success: true, id: response.id };
  }

  async login(username: string, pass: string, deviceInfo = 'Unknown Device', userAgent = 'Unknown', ip = 'Unknown') {
    const query = await this.couchDb.db.find({ selector: { type: 'user', username } });
    const user = query.docs[0];

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = jwt.sign({ userId: user._id, username: user.username }, this.getAccessSecret(), { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, this.getRefreshSecret(), { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const sessionId = crypto.randomUUID();

    const sessionData: any = {
      _id: sessionId,
      type: 'session',
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
    await this.redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', REDIS_SESSION_TTL);

    return { accessToken, refreshToken, sessionId, userId: user._id, username: user.username };
  }

  async refresh(cookieValue: string) {
    const [sessionId, rawRefreshToken] = cookieValue.split(':');
    if (!sessionId || !rawRefreshToken) throw new UnauthorizedException('Invalid token format');

    let payload: any;
    try {
      payload = jwt.verify(rawRefreshToken, this.getRefreshSecret());
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }

    let sessionData: any;
    const cachedSession = await this.redis.get(`session:${sessionId}`);

    if (cachedSession) {
      sessionData = JSON.parse(cachedSession);
    } else {
      try {
        sessionData = await this.couchDb.db.get(sessionId);
      } catch {
        throw new UnauthorizedException('Session not found');
      }
    }

    if (!sessionData || !sessionData.isValid) {
      throw new UnauthorizedException('Session revoked');
    }

    const isTokenValid = await bcrypt.compare(rawRefreshToken, sessionData.hashedRefreshToken);
    if (!isTokenValid) {
      sessionData.isValid = false;
      await this.couchDb.db.insert(sessionData);
      await this.redis.del(`session:${sessionId}`);
      throw new ForbiddenException('Security breach detected. Session revoked.');
    }

    const newAccessToken = jwt.sign({ userId: sessionData.userId, username: payload.username }, this.getAccessSecret(), { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: sessionData.userId }, this.getRefreshSecret(), { expiresIn: '7d' });

    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    const updatedSession = {
      ...sessionData,
      hashedRefreshToken: newHashedRefreshToken,
      updatedAt: new Date().toISOString(),
    };

    const response = await this.couchDb.db.insert(updatedSession);
    updatedSession._rev = response.rev;

    const REDIS_SESSION_TTL = 7 * 24 * 60 * 60;
    await this.redis.set(`session:${sessionId}`, JSON.stringify(updatedSession), 'EX', REDIS_SESSION_TTL);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, sessionId };
  }

  async logout(cookieValue: string) {
    const [sessionId] = cookieValue.split(':');
    if (sessionId) {
      await this.redis.del(`session:${sessionId}`);
      try {
        const sessionData = await this.couchDb.db.get(sessionId);
        sessionData.isValid = false;
        await this.couchDb.db.insert(sessionData);
      } catch {}
    }
  }
}