/**
 * Options for the IORedisAdaptor.
 */
interface IORedisAdaptorOptions {
  client: any;
  namespace?: string;
  lifetime?: number;
}

/**
 * Adaptor for integrating IORedis with sequelize-transparent-cache.
 */
export class IORedisAdaptor {
  private client: any;
  private namespace?: string;
  private lifetime?: number;

  /**
   * Creates an instance of IORedisAdaptor.
   * @param {IORedisAdaptorOptions} options - The options for the adaptor.
   */
  constructor({ client, namespace, lifetime }: IORedisAdaptorOptions) {
    this.client = client;
    this.namespace = namespace;
    this.lifetime = lifetime;
  }

  /**
   * Adds the namespace to the key if it exists.
   * @param {string[]} key - The key to add the namespace to.
   * @returns {string} - The key with the namespace.
   */
  private _withNamespace(key: string[]): string {
    const namespace = this.namespace;
    const keyWithNamespace = namespace ? [namespace, ...key] : key;
    return keyWithNamespace.join(':');
  }

  /**
   * Sets a value in the cache.
   * @param {string[]} key - The key to set the value for.
   * @param {any} value - The value to set.
   * @returns {Promise<any>} - A promise that resolves when the value is set.
   */
  set(key: string[], value: any): Promise<any> {
    const options = this.lifetime ? ['EX', this.lifetime] : [];
    return this.client.set(this._withNamespace(key), JSON.stringify(value), ...options);
  }

  /**
   * Gets a value from the cache.
   * @param {string[]} key - The key to get the value for.
   * @returns {Promise<any>} - A promise that resolves with the value.
   */
  async get(key: string[]): Promise<any> {
    const data = await this.client.get(this._withNamespace(key));
    if (!data) {
      return data;
    }
    return JSON.parse(data, (key, value) => {
      return value && value.type === 'Buffer' ? Buffer.from(value.data) : value;
    });
  }

  /**
   * Deletes a value from the cache.
   * @param {string[]} key - The key to delete the value for.
   * @returns {Promise<any>} - A promise that resolves when the value is deleted.
   */
  del(key: string[]): Promise<any> {
    return this.client.del(this._withNamespace(key));
  }
}
