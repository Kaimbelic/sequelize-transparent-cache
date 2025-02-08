import { auto as buildClassAutoMethods, manual as buildClassManualMethods } from './methods/class';
import buildInstanceMethods from './methods/instance';
import { Model, ModelStatic } from 'sequelize';
import { CacheableModelClass, CacheClient } from './types';

/**
 * Initializes the cache client and returns an object with the withCache method.
 * @param client - The cache client.
 * @returns An object containing the withCache method.
 */
export default (client: CacheClient) => ({
  /**
   * Adds caching methods to a Sequelize model class.
   * @param modelClass - The Sequelize model class.
   * @returns The model class with caching methods.
   */
  withCache<T extends ModelStatic<Model>>(modelClass: T): T & CacheableModelClass {
    (modelClass as any).cache = function (customId?: string) {
      return customId
        ? buildClassManualMethods(client, this, customId)
        : buildClassAutoMethods(client, this);
    };

    (modelClass as any).prototype.cache = function () {
      return buildInstanceMethods(client, this);
    };

    return modelClass as T & CacheableModelClass;
  }
});
