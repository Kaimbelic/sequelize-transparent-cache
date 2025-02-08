import { Model, SaveOptions, UpdateOptions, DestroyOptions, FindOptions } from 'sequelize';
import * as cache from '../cache';

/**
 * Adds caching methods to a Sequelize instance.
 * @param client - The cache client.
 * @param instance - The Sequelize model instance.
 * @returns An object containing the caching methods.
 */
function instanceMethods(client: any, instance: Model) {
  return {
    /**
     * Returns the cache client.
     * @returns The cache client.
     */
    client() { return client; },

    /**
     * Saves the instance and caches it.
     * @param args - The save options.
     * @returns A promise that resolves to the saved instance.
     */
    save(...args: [options?: SaveOptions]): Promise<Model> {
      return instance.save.apply(instance, args)
        .then((instance: Model) => cache.save(client, instance));
    },

    /**
     * Clears the instance from the cache.
     * @returns A promise that resolves when the cache is cleared.
     */
    clear(): Promise<void> {
      return cache.destroy(client, instance).then(() => undefined);
    }
  };
}

export default instanceMethods;
