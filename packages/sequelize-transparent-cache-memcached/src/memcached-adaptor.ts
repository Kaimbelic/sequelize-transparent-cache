const hour = 60 * 60;

interface MemcachedClient {
  set: (key: string, value: string, lifetime: number, callback: (error: any) => void) => void;
  get: (key: string, callback: (error: any, data: string | null) => void) => void;
  del: (key: string, callback: (error: any) => void) => void;
}

interface MemcachedAdaptorOptions {
  client: MemcachedClient;
  namespace?: string;
  lifetime?: number;
}

export class MemcachedAdaptor {
  private client: MemcachedClient;
  private namespace?: string;
  private lifetime: number;

  constructor({ client, namespace, lifetime = hour }: MemcachedAdaptorOptions) {
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
    return new Promise((resolve, reject) => {
      this.client.set(
        this._withNamespace(key),
        JSON.stringify(value),
        this.lifetime,
        error => (error ? reject(error) : resolve())
      );
    });
  }

  get(key: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(this._withNamespace(key), (error, data) => {
        if (error) {
          return reject(error);
        }
        if (!data) {
          return resolve(data);
        }
        resolve(JSON.parse(data));
      });
    });
  }

  del(key: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.del(this._withNamespace(key), error => (error ? reject(error) : resolve()));
    });
  }
}

export default MemcachedAdaptor;
