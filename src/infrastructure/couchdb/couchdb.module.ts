import { Module } from '@nestjs/common';
import { CouchDbClient } from './couchdb.client';

@Module({
  providers: [CouchDbClient],
  exports: [CouchDbClient], 
})
export class CouchDbModule {}