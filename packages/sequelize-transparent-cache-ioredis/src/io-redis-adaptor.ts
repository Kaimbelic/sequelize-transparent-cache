interface IORedisAdaptorOptions {
  client: any;
  namespace?: string;
  lifetime?: number;
}

class IORedisAdaptor {
  private client: any;
  private namespace?: string;
  private lifetime?: number;

  constructor({ client, namespace, lifetime }: IORedisAdaptorOptions) {
    this.client = client;
    this.namespace = namespace;
    this.lifetime = lifetime;
  }

  private _withNamespace(key: string[]): string {
    const namespace = this.namespace;
    const keyWithNamespace = namespace ? [namespace, ...key] : key;
    return keyWithNamespace.join(':');
  }

  set(key: string[], value: any): Promise<any> {
    const options = this.lifetime ? ['EX', this.lifetime] : [];
    return this.client.set(this._withNamespace(key), JSON.stringify(value), ...options);
  }

  async get(key: string[]): Promise<any> {
    const data = await this.client.get(this._withNamespace(key));
    if (!data) {
      return data;
    }
    return JSON.parse(data, (key, value) => {
      return value && value.type === 'Buffer' ? Buffer.from(value.data) : value;
    });
  }

  del(key: string[]): Promise<any> {
    return this.client.del(this._withNamespace(key));
  }
}

export default IORedisAdaptor;
