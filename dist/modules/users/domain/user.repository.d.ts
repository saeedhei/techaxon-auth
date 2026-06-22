import { User } from './user.interface';
export declare const USER_REPOSITORY = "USER_REPOSITORY";
export interface IUserRepository {
    create(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(emailNormalized: string): Promise<User | null>;
    update(user: User): Promise<void>;
}
