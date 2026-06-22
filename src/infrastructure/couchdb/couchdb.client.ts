import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CouchDbClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor() {
    const url = process.env.COUCHDB_URL;
    const user = process.env.COUCHDB_USER;
    const pass = process.env.COUCHDB_PASSWORD;

    if (!url || !user || !pass) {
      throw new Error('Missing CouchDB environment variables');
    }

    this.baseUrl = url;
    this.username = user;
    this.password = pass;
  }

  // -------------------------
  // INTERNAL REQUEST WRAPPER
  // -------------------------
  private async request(path: string, options: RequestInit = {}) {
    const auth = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString('base64');

    const res = await fetch(`${this.baseUrl}/${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const error = await res.text();

      throw new HttpException(
        `CouchDB error: ${error}`,
        res.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return res.json();
  }

  // -------------------------
  // GET DOCUMENT
  // -------------------------
  async get(db: string, id: string) {
    return this.request(`${db}/${id}`);
  }

  // -------------------------
  // CREATE / UPDATE DOCUMENT
  // -------------------------
  async put(db: string, doc: any) {
    return this.request(`${db}/${doc._id}`, {
      method: 'PUT',
      body: JSON.stringify(doc),
    });
  }

  // -------------------------
  // QUERY VIEW
  // -------------------------
  async query(
    db: string,
    view: string,
    params?: Record<string, any>,
  ) {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : '';

    return this.request(
      `${db}/_design/${view}/_view/${view}${queryString}`,
    );
  }
}