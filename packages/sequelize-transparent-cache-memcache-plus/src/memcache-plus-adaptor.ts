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

export class MemcachePlusAdaptor {
  private client: MemcachePlusClient;
  private namespace?: string;
  private lifetime: number;

  constructor({ client, namespace, lifetime = 0 }: MemcachePlusAdaptorOptions) {
    this.client = client;
    this.namespace = namespace;
    this.lifetime = lifetime;
  }

  private _withNamespace(key: string[]): string {
    const namespace = this.namespace;
    const keyWithNamespace = namespace ? [namespace, ...key] : key;
    return keyWithNamespace.join(':');
  }

  set(key: string[], value: any): Promise<void> {
    return this.client.set(this._withNamespace(key), value, this.lifetime);
  }

  get(key: string[]): Promise<any> {
    return this.client.get(this._withNamespace(key));
  }

  del(key: string[]): Promise<void> {
    return this.client.delete(this._withNamespace(key));
  }
}
