export declare class CouchDbClient {
    private readonly baseUrl;
    private readonly username;
    private readonly password;
    constructor();
    private request;
    get(db: string, id: string): Promise<any>;
    put(db: string, doc: any): Promise<any>;
    query(db: string, view: string, params?: Record<string, any>): Promise<any>;
}
