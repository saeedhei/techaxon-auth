import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nano from 'nano';
import { UserRepository } from './user-repository.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CouchDbService implements OnModuleInit, UserRepository {
  private couch!: nano.ServerScope;
  private db!: nano.DocumentScope<any>;

  // Using the Config module Saeed installed!
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url =
      this.configService.get<string>('COUCHDB_URL') || 'http://admin:password@localhost:5984';
    this.couch = nano(url);
    this.db = this.couch.use('techaxon_core');
  }

  async createUser(user: any): Promise<any> {
    const response = await this.db.insert(user);
    return { id: response.id, rev: response.rev };
  }
}
