export declare abstract class UserRepository {
    abstract findByUsername(username: string): Promise<any>;
    abstract createUser(user: any): Promise<any>;
}
