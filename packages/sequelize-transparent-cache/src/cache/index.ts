import { Model, ModelStatic } from 'sequelize';
import { instanceToData, dataToInstance } from './util';

/**
 * Gets the model of a Sequelize instance.
 * @param instance - The Sequelize model instance.
 * @returns The Sequelize model.
 */
function getInstanceModel(instance: Model): ModelStatic<Model> {
  return instance.constructor as ModelStatic<Model>;
}

/**
 * Gets the cache key for a Sequelize instance.
 * @param instance - The Sequelize model instance.
 * @returns The cache key.
 */
function getInstanceCacheKey(instance: Model): any[] {
  return getInstanceModel(instance).primaryKeyAttributes.map(pk => instance.getDataValue(pk));
}

/**
 * Saves a Sequelize instance to the cache.
 * @param client - The cache client.
 * @param instance - The Sequelize model instance.
 * @param customKey - An optional custom cache key.
 * @returns A promise that resolves to the saved instance.
 */
async function save(client: any, instance: Model, customKey?: string): Promise<Model> {
  if (!instance) {
    return Promise.resolve(instance);
  }

  const key = [
    getInstanceModel(instance).name
  ];

  if (customKey) {
    key.push(customKey);
  } else {
    key.push(...getInstanceCacheKey(instance));
  }

  await client.set(key, instanceToData(instance));
  return instance;
}

/**
 * Saves multiple Sequelize instances to the cache.
 * @param client - The cache client.
 * @param model - The Sequelize model.
 * @param instances - The Sequelize model instances.
 * @param customKey - The custom cache key.
 * @returns A promise that resolves to the saved instances.
 */
async function saveAll(client: any, model: ModelStatic<Model>, instances: Model[], customKey: string): Promise<Model[]> {
  const key = [
    model.name,
    customKey
  ];

  await client.set(key, instances.map(instanceToData));
  return instances;
}

/**
 * Gets multiple Sequelize instances from the cache.
 * @param client - The cache client.
 * @param model - The Sequelize model.
 * @param customKey - The custom cache key.
 * @returns A promise that resolves to the found instances or null.
 */
async function getAll(client: any, model: ModelStatic<Model>, customKey: string): Promise<Model[] | null> {
  const key = [
    model.name,
    customKey
  ];

  const dataArray = await client.get(key);
  if (!dataArray) {
    return null;
  }
  return dataArray.map((data: Record<string, any>) => dataToInstance(model, data));
}

/**
 * Gets a Sequelize instance from the cache.
 * @param client - The cache client.
 * @param model - The Sequelize model.
 * @param id - The primary key.
 * @returns A promise that resolves to the found instance or null.
 */
async function get(client: any, model: ModelStatic<Model>, id: any): Promise<Model | null> {
  const key = [
    model.name,
    id
  ];

  const data = await client.get(key);
  return dataToInstance(model, data);
}

/**
 * Destroys a Sequelize instance and removes it from the cache.
 * @param client - The cache client.
 * @param instance - The Sequelize model instance.
 * @returns A promise that resolves to the destroyed instance.
 */
async function destroy(client: any, instance: Model): Promise<Model | null> {
  if (!instance) {
    return Promise.resolve(instance);
  }

  const key = [
    getInstanceModel(instance).name,
    ...getInstanceCacheKey(instance)
  ];
  await client.del(key);
  return instance;
}

/**
 * Clears the cache for a custom key.
 * @param client - The cache client.
 * @param model - The Sequelize model.
 * @param customKey - The custom cache key.
 * @returns A promise that resolves when the cache is cleared.
 */
async function clearKey(client: any, model: ModelStatic<Model>, customKey: string): Promise<void> {
  const key = [
    model.name,
    customKey
  ];
  await client.del(key);
}

export {
  save,
  saveAll,
  get,
  getAll,
  destroy,
  clearKey
};
