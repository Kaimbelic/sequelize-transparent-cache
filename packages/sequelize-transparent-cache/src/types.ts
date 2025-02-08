import { ModelStatic, Model } from 'sequelize';


export interface CacheableModelClass extends ModelStatic<Model<any, any>> {
  cache: (customId?: string) => any;
  prototype: Model & {
    cache: () => any;
  };
}
