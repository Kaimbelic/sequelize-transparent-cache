import VariableAdaptor from '../../../../sequelize-transparent-cache-variable/src';
import sequelizeCache from '../..';
import sequelize, { User } from './sequelize';
import { CacheableModelInstance } from '../../types';

const variableAdaptor = new VariableAdaptor();
const { withCache } = sequelizeCache(variableAdaptor);

const CachedUser = withCache(User);

const cacheStore = CachedUser.cache().client().store;

beforeAll(() => sequelize.sync());

describe('Instance methods', () => {
  test('Cache is empty on start', () => {
    expect(cacheStore).toEqual({});
  });

  const user: CacheableModelInstance<User> = CachedUser.build({
    id: 1,
    name: 'Daniel'
  }) as CacheableModelInstance<User>;

  test('Create', async () => {
    await user.cache().save();

    // User cached after create
    expect(cacheStore.User[1]).toEqual(
      JSON.stringify(user.get())
    );

    // Cached user correctly loaded
    expect((await CachedUser.cache().findByPk(1)).get()).toEqual(
      user.get()
    );
  });

  test('Update', async () => {
    await user.cache().update({
      name: 'Dmitry'
    });

    // User name was updated
    expect(user.name).toBe('Dmitry');

    // User cached after upsert
    expect(cacheStore.User[1]).toEqual(
      JSON.stringify(user.get())
    );
  });

  test('Clear', async () => {
    // Cached user correctly loaded
    expect((await CachedUser.cache().findByPk(1)).get()).toEqual(
      user.get()
    );
    await user.cache().clear();

    expect(cacheStore.User[1]).toBeUndefined();
  });

  test('Destroy', async () => {
    await user.cache().destroy();

    expect(cacheStore.User[1]).toBeUndefined();
    expect(await CachedUser.findByPk(1)).toBeNull();
  });
});
