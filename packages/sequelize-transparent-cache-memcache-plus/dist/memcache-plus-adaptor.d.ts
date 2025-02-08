interface MemcachePlusClient {
    set: (key: string, value: any, lifetime: number) => Promise<void>;
    get: (key: string) => Promise<any>;
    delete: (key: string) => Promise<void>;
}
interface MemcachePlusAdaptorOptions {
    client: MemcachePlusClient;
    namespace?: string;
    lifetime?: number;
}
export declare class MemcachePlusAdaptor {
    private client;
    private namespace?;
    private lifetime;
    constructor({ client, namespace, lifetime }: MemcachePlusAdaptorOptions);
    private _withNamespace;
    set(key: string[], value: any): Promise<void>;
    get(key: string[]): Promise<any>;
    del(key: string[]): Promise<void>;
}
export {};
