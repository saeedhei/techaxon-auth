import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CouchDbService } from './couchdb.service';
import { UserRepository } from './user-repository.interface';

@Global()
@Module({
  imports: [ConfigModule], // Required for the config service
  providers: [
    CouchDbService,
    {
      provide: UserRepository,
      useExisting: CouchDbService,
    },
  ],
  exports: [CouchDbService, UserRepository],
})
export class DatabaseModule {}
