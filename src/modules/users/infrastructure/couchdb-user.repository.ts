import { Injectable } from '@nestjs/common';
import { CouchDbClient } from '../../../infrastructure/couchdb/couchdb.client';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.interface';

@Injectable()
export class CouchDbUserRepository implements IUserRepository {
  private readonly dbName = 'auth_db';

  constructor(private readonly db: CouchDbClient) {}

  // -------------------------
  // CREATE USER
  // -------------------------
  async create(user: User): Promise<void> {
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

  // -------------------------
  // FIND BY ID
  // -------------------------
  async findById(id: string): Promise<User | null> {
    try {
      const doc = await this.db.get(this.dbName, `user:${id}`);

      if (!doc || doc.type !== 'user') {
        return null;
      }

      return this.toDomain(doc);
    } catch (err: any) {
      if (err?.status === 404) return null;
      throw err;
    }
  }

  // -------------------------
  // FIND BY EMAIL
  // -------------------------
  async findByEmail(emailNormalized: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        this.dbName,
        'users/by-email',
        {
          key: emailNormalized,
          include_docs: true,
        },
      );

      const row = result.rows?.[0];
      if (!row?.doc) return null;

      return this.toDomain(row.doc);
    } catch (err) {
      // IAM-safe: no crash on missing view
      return null;
    }
  }

  // -------------------------
  // UPDATE USER
  // -------------------------
  async update(user: User): Promise<void> {
    const existing = await this.db.get(
      this.dbName,
      `user:${user.id}`,
    );

    await this.db.put(this.dbName, {
      ...existing,
      ...user,
      updatedAt: new Date().toISOString(),
    });
  }

  // -------------------------
  // MAPPER
  // -------------------------
  private toDomain(doc: any): User {
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
}