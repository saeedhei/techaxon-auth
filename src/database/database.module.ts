import { Module, Global } from '@nestjs/common';
import { CouchDbService } from './couchdb.service';
import { RedisService } from './redis.service';

@Global() // Makes database services globally available without re-importing
@Module({
  providers: [CouchDbService, RedisService],
  exports: [CouchDbService, RedisService],
})
export class DatabaseModule {}