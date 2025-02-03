import { auto as buildClassAutoMethods, manual as buildClassManualMethods } from './methods/class';
import buildInstanceMethods from './methods/instance';
import { Model, ModelStatic } from 'sequelize';

interface CacheableModelClass extends ModelStatic<Model<any, any>> {
  cache: (customId?: string) => any;
  prototype: Model & {
    cache: () => any;
  };
}

export default (client: any) => ({
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
