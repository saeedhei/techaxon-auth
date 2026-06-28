import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user-repository.interface";
import { CouchDbService } from "./couchdb.service";

@Injectable()
export class CouchDbUserRepository implements UserRepository {
  constructor(private readonly couchDb: CouchDbService) {}

  async findByUsername(username: string): Promise<any> {
    const query = await this.couchDb.db.find({
      selector: { type: "user", username },
    });
    return query.docs[0] || null;
  }

  async createUser(user: any): Promise<any> {
    const response = await this.couchDb.db.insert(user);
    return { id: response.id, rev: response.rev };
  }
}
