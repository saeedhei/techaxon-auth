import { Global, Module } from '@nestjs/common';
import { CouchDbService } from './couchdb.service';
import { UserRepository } from '../../users/user.repository';

@Global()
@Module({
  providers: [
    CouchDbService,
    {
      provide: UserRepository,
      useExisting: CouchDbService,
    },
  ],
  exports: [CouchDbService, UserRepository],
})
export class CouchdbModule {}
