import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { CouchDbUserRepository } from './infrastructure/couchdb-user.repository';
import { CouchDbModule } from '../../infrastructure/couchdb/couchdb.module';
import { USER_REPOSITORY } from './domain/user.repository';

@Module({
  imports: [CouchDbModule],

  providers: [
    UsersService,

    {
      provide: USER_REPOSITORY, 
      useClass: CouchDbUserRepository,
    },
  ],

  exports: [UsersService],
})
export class UsersModule {}