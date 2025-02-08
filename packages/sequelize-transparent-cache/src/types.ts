import { ModelStatic, Model } from 'sequelize';

export interface CacheableModelClass extends ModelStatic<Model<any, any>> {
  cache: (customId?: string) => any;
  prototype: Model & {
    cache: () => any;
  };
}

export type CacheableModelInstance<T extends Model<any, any>> = T & {
  cache: () => any;
};
