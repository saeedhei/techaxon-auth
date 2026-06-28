import { Module, Global } from "@nestjs/common";
import { CouchDbService } from "./couchdb.service";
import { RedisService } from "./redis.service";
import { UserRepository } from "./user-repository.interface";
import { CouchDbUserRepository } from "./couchdb-user.repository";

@Global()
@Module({
  providers: [
    CouchDbService,
    RedisService,
    {
      provide: UserRepository,
      useClass: CouchDbUserRepository, // Mapping the abstraction to CouchDB
    },
  ],
  exports: [CouchDbService, RedisService, UserRepository],
})
export class DatabaseModule {}
