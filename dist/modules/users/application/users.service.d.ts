import { IUserRepository } from '../domain/user.repository';
export interface CreateUserInput {
    email: string;
    password: string;
}
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    createUser(input: CreateUserInput): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        email: string;
        emailVerified: boolean;
        status: "active";
        createdAt: string;
    }>;
    findByEmail(email: string): Promise<import("../domain/user.interface").User>;
    findById(id: string): Promise<import("../domain/user.interface").User>;
    disableUser(id: string): Promise<{
        success: boolean;
    }>;
    verifyPassword(user: any, password: string): Promise<boolean>;
}
