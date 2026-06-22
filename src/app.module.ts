import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CouchDbModule } from './infrastructure/couchdb/couchdb.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    AuthModule,
    UsersModule,
    CouchDbModule
  ],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { DatabaseModule } from './database/database.module';
// import { AuthModule } from './auth/auth.module';

// @Module({
//   imports: [DatabaseModule, AuthModule],
// })
// export class AppModule {}