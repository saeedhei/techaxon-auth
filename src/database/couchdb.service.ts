import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nano from 'nano';

@Injectable()
export class CouchDbService implements OnModuleInit {
  private couch!: nano.ServerScope;
  public db!: nano.DocumentScope<any>;

  onModuleInit() {
    const url = process.env.COUCHDB_URL || 'http://admin:password@localhost:5984';
    this.couch = nano(url);
    this.db = this.couch.use('techaxon_core');
  }
}