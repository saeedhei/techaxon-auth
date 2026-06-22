import { UserRepository } from "./user-repository.interface";
import { CouchDbService } from "./couchdb.service";
export declare class CouchDbUserRepository implements UserRepository {
    private readonly couchDb;
    constructor(couchDb: CouchDbService);
    findByUsername(username: string): Promise<any>;
    createUser(user: any): Promise<any>;
}
