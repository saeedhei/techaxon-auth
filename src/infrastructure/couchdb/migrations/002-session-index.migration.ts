import { CouchDbService } from '../couchdb.service';
import type { CouchDbMigration } from './migration.interface';

export class SessionIndexMigration implements CouchDbMigration {
  name = '002-session-index';

  constructor(private readonly couchDbService: CouchDbService) {}

  async up(): Promise<void> {
    const db = this.couchDbService.getDatabase();

    await db.createIndex({
      name: 'session-user-index',
      type: 'json',
      index: {
        fields: ['type', 'userId'],
      },
    });

    await db.createIndex({
      name: 'session-refresh-token-index',
      type: 'json',
      index: {
        fields: ['type', 'refreshTokenHash'],
      },
    });
  }
}
