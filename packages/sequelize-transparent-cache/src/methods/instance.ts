import { Model, SaveOptions, UpdateOptions, DestroyOptions, FindOptions } from 'sequelize';
import * as cache from '../cache';

function instanceMethods(client: any, instance: Model) {
  return {
    client() { return client; },
    save(...args: [options?: SaveOptions]): Promise<Model> {
      return instance.save.apply(instance, args)
        .then((instance: Model) => cache.save(client, instance));
    },
    update(...args: [values: any, options?: UpdateOptions]): Promise<Model> {
      return instance.update
        .apply(instance, args)
        .then((instance: Model) => cache.save(client, instance));
    },
    reload(...args: [options?: FindOptions]): Promise<Model> {
      return instance.reload
        .apply(instance, args)
        .then((instance: Model) => cache.save(client, instance));
    },
    destroy(...args: [options?: DestroyOptions]): Promise<void> {
      return instance.destroy.apply(instance, args)
        .then(() => {
          return cache.destroy(client, instance).then(() => undefined);
        });
    },
    clear(): Promise<void> {
      return cache.destroy(client, instance).then(() => undefined);
    }
  };
}

export default instanceMethods;
