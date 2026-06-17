import { OnModuleInit } from '@nestjs/common';
import * as nano from 'nano';
export declare class CouchDbService implements OnModuleInit {
    private couch;
    db: nano.DocumentScope<any>;
    onModuleInit(): void;
}
