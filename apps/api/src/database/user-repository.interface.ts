import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class UserRepository {
  abstract findByUsername(username: string): Promise<any>;
  abstract createUser(user: any): Promise<any>;
}
