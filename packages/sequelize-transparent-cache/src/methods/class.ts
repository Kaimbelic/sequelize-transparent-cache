import { Model, ModelStatic, CreateOptions, UpsertOptions, FindOptions } from 'sequelize';
import * as cache from '../cache';

/**
 * Builds automatic caching methods for a Sequelize model.
 * @param client - The cache client.
 * @param model - The Sequelize model.
 * @returns An object containing the caching methods.
 */
function buildAutoMethods(client: any, model: ModelStatic<Model>) {
  return {
    /**
     * Returns the cache client.
     * @returns The cache client.
     */
    client() {
      return client;
    },

    /**
     * Creates a new instance and caches it.
     * @param values - The create values.
     * @param options - The create options.
     * @returns A promise that resolves to the created instance.
     */
    create(values: any, options?: CreateOptions): Promise<Model> {
      return model.create(values, options)
        .then((instance: Model) => {
          return cache.save(client, instance);
        });
    },

    /**
     * Finds an instance by primary key and caches it.
     * @param id - The primary key.
     * @param options - The find options.
     * @returns A promise that resolves to the found instance or null.
     */
    findByPk(id: any, options?: FindOptions): Promise<Model | null> {
      return cache.get(client, model, id)
        .then((instance: Model | null) => {
          if (instance) {
            return instance;
          }

          return model.findByPk(id, options)
            .then((instance: Model | null) => {
              if (instance) {
                return cache.save(client, instance);
              }
              return instance;
            });
        });
    },

    /**
     * Upserts an instance and clears the cache.
     * @param data - The upsert data.
     * @param args - The upsert options.
     * @returns A promise that resolves to the upsert result.
     */
    upsert(data: any, ...args: [options?: UpsertOptions]): Promise<[Model, boolean | null]> {
      return model.upsert.apply(model, [data, ...args]).then((result: [Model, boolean | null]) => {
        return cache.destroy(client, model.build(data))
          .then(() => result);
      });
    },

    /**
     * Alias for upsert.
     * @param args - The upsert data and options.
     * @returns A promise that resolves to the upsert result.
     */
    insertOrUpdate(...args: [data: any, options?: UpsertOptions]): Promise<boolean | null> {
      return this.upsert.apply(this, args).then(([, created]) => created);
    }
  };
}

/**
 * Builds manual caching methods for a Sequelize model.
 * @param client - The cache client.
 * @param model - The Sequelize model.
 * @param customKey - The custom cache key.
 * @returns An object containing the caching methods.
 */
function buildManualMethods(client: any, model: ModelStatic<Model>, customKey: string) {
  return {
    /**
     * Returns the cache client.
     * @returns The cache client.
     */
    client() {
      return client;
    },

    /**
     * Finds all instances and caches them.
     * @param args - The find options.
     * @param customId - The custom cache id.
     * @returns A promise that resolves to the found instances or null.
     */
    findAll(...args: [options?: FindOptions]): Promise<Model[] | null> {
      return cache.getAll(client, model, customKey)
        .then((instances: Model[] | null) => {
          if (instances) { // any array - cache hit
            return instances;
          }

          return model.findAll.apply(model, args)
            .then((instances: Model[]) => cache.saveAll(client, model, instances, customKey));
        });
    },

    /**
     * Finds one instance and caches it.
     * @param args - The find options.
     * @param customId - The custom cache id.
     * @returns A promise that resolves to the found instance or null.
     */
    findOne(...args: [options?: FindOptions]): Promise<Model | null> {
      return cache.get(client, model, customKey)
        .then((instance: Model | null) => {
          if (instance) {
            return instance;
          }

          return model.findOne.apply(model, args)
            .then((instance: Model | null) => {
              if (instance) {
                return cache.save(client, instance, customKey);
              }
              return instance;
            });
        });
    },

    /**
     * Clears the cache for the custom key.
     * @returns A promise that resolves when the cache is cleared.
     */
    clear(): Promise<void> {
      return cache.clearKey(client, model, customKey);
    }
  };
}

export { buildAutoMethods as auto, buildManualMethods as manual };
