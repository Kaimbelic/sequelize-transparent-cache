import { Model, ModelStatic } from 'sequelize';
import { instanceToData, dataToInstance } from './util';

function getInstanceModel(instance: Model): ModelStatic<Model> {
  return instance.constructor as ModelStatic<Model>;
}

function getInstanceCacheKey(instance: Model): any[] {
  return getInstanceModel(instance).primaryKeyAttributes.map(pk => instance.getDataValue(pk));
}

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

async function saveAll(client: any, model: ModelStatic<Model>, instances: Model[], customKey: string): Promise<Model[]> {
  const key = [
    model.name,
    customKey
  ];

  await client.set(key, instances.map(instanceToData));
  return instances;
}

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

async function get(client: any, model: ModelStatic<Model>, id: any): Promise<Model | null> {
  const key = [
    model.name,
    id
  ];

  const data = await client.get(key);
  return dataToInstance(model, data);
}

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
