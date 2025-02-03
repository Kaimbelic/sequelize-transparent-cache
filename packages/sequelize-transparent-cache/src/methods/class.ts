import { Model, ModelStatic, CreateOptions, UpsertOptions, FindOptions } from 'sequelize';
import * as cache from '../cache';

function buildAutoMethods(client: any, model: ModelStatic<Model>) {
  return {
    client() {
      return client;
    },
    create(...args: [values?: any, options?: CreateOptions]): Promise<Model> {
      return model.create.apply(model, args)
        .then((instance: Model) => {
          return cache.save(client, instance);
        });
    },
    findByPk(id: any, ...args: [options?: FindOptions]): Promise<Model | null> {
      return cache.get(client, model, id)
        .then((instance: Model | null) => {
          console.log('instance', instance);
          if (instance) {
            return instance;
          }

          return model.findByPk.apply(model, [id, ...args])
            .then((instance: Model | null) => {
              console.log('instance', instance);
              if (instance) {
                return cache.save(client, instance);
              }
              return instance;
            });
        });
    },
    findById(...args: [id: any, options?: FindOptions]): Promise<Model | null> {
      return this.findByPk.apply(this, args);
    },
    upsert(data: any, ...args: [options?: UpsertOptions]): Promise<[Model, boolean | null]> {
      return model.upsert.apply(model, [data, ...args]).then((result: [Model, boolean | null]) => {
        return cache.destroy(client, model.build(data))
          .then(() => result);
      });
    },
    insertOrUpdate(...args: [data: any, options?: UpsertOptions]): Promise<boolean | null> {
      return this.upsert.apply(this, args).then(([, created]) => created);
    }
  };
}

function buildManualMethods(client: any, model: ModelStatic<Model>, customKey: string) {
  return {
    client() {
      return client;
    },
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
    clear(): Promise<void> {
      return cache.clearKey(client, model, customKey);
    }
  };
}

export { buildAutoMethods as auto, buildManualMethods as manual };
