import { CouchDbClient } from '../../../infrastructure/couchdb/couchdb.client';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.interface';
export declare class CouchDbUserRepository implements IUserRepository {
    private readonly db;
    private readonly dbName;
    constructor(db: CouchDbClient);
    create(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(emailNormalized: string): Promise<User | null>;
    update(user: User): Promise<void>;
    private toDomain;
}
