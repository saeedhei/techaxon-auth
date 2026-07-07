import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class UserRepository {
  abstract createUser(user: any): Promise<any>;
}
