import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import nano from 'nano';

import {
  UserRepository,
  type CreateUserData,
  type CreateUserResult,
} from '../../users/user.repository';

import type { UserDocument, IamDocument } from './documents';

import couchdbConfig from '../../config/couchdb.config';

@Injectable()
export class CouchDbService implements OnModuleInit, UserRepository {
  private couch!: nano.ServerScope;

  /**
   * Single CouchDB database for IAM documents:
   *
   * - user
   * - email_claim
   * - migration
   * - session
   * - verification_token
   * - audit
   */
  private db!: nano.DocumentScope<IamDocument>;

  constructor(
    @Inject(couchdbConfig.KEY)
    private readonly config: ConfigType<typeof couchdbConfig>,
  ) {}

  onModuleInit() {
    this.couch = nano(this.config.url);
    this.db = this.couch.use(this.config.database);
  }

  /**
   * Create user document.
   */
  async createUser(user: CreateUserData): Promise<CreateUserResult> {
    const response = await this.db.insert(user);

    return {
      id: response.id,
      rev: response.rev,
    };
  }

  /**
   * Find user by normalized email.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const query = await this.db.find({
      selector: {
        type: 'user',
        email: normalizedEmail,
      },
    });

    if (query.docs.length === 0) {
      return null;
    }

    return query.docs[0] as UserDocument;
  }

  /**
   * Reserve email address atomically.
   *
   * CouchDB guarantees unique _id values.
   *
   * Example:
   *
   * email:test@example.com
   */
  async claimEmail(email: string, userId: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    await this.db.insert({
      _id: `email:${normalizedEmail}`,
      type: 'email_claim',
      email: normalizedEmail,
      userId,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Remove email reservation.
   *
   * Used when user creation fails
   * after email was claimed.
   */
  async releaseEmailClaim(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();

    const id = `email:${normalizedEmail}`;

    try {
      const document = await this.db.get(id);

      if (!document._rev) {
        return;
      }

      await this.db.destroy(id, document._rev);
    } catch {
      /**
       * Nothing to release.
       *
       * Possible reasons:
       * - document does not exist
       * - already removed
       */
    }
  }

  /**
   * Exposes CouchDB connection for:
   *
   * - migrations
   * - indexes
   * - infrastructure tasks
   */
  getDatabase(): nano.DocumentScope<IamDocument> {
    return this.db;
  }
}
