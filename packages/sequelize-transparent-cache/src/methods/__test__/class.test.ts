import VariableAdaptor from '../../../../sequelize-transparent-cache-variable/dist';
import sequelizeCache from '../..';
import sequelize from './sequelize';

// Jest imports
import { describe, expect, test, beforeAll } from '@jest/globals';

const variableAdaptor = new VariableAdaptor();
const { withCache } = sequelizeCache(variableAdaptor);

const CachedUser = withCache(sequelize.models.User);
const CachedArticle = withCache(sequelize.models.Article);
const CachedComment = withCache(sequelize.models.Comment);
const CachedGroup = withCache(sequelize.models.Group);

const cacheStore = CachedUser.cache().client().store;

beforeAll(() => sequelize.sync());

describe('Class methods', () => {
  test('Cache is empty on start', () => {
    expect(cacheStore).toEqual({});
  });

  test('Create', async () => {
    const user = await CachedUser.cache().create({
      id: 1,
      name: 'Daniel'
    });

    const article = await CachedArticle.cache().create({
      uuid: '2086c06e-9dd9-4ee3-84b9-9e415dfd9c4c',
      title: 'New article'
    });
    await user.setArticles([article]);
    await user.cache().save();

    const comment = await CachedComment.cache().create({
      userId: user.id,
      articleUuid: article.uuid,
      body: 'New comment'
    });

    const group = await CachedGroup.cache().create({
      id: 1,
      name: 'Group of wonderful people'
    });

    await group.setGroupUsers([user]);
    await group.cache().save();

    // User with default primary key cached after create
    expect(cacheStore.User[1]).toEqual(
      JSON.stringify(user)
    );

    // Entity with custom primary key cached after create
    expect(cacheStore.Article[article.uuid]).toEqual(
      JSON.stringify(article)
    );

    // Entity with composite primary keys cached after create
    expect(cacheStore.Comment[`${comment.userId},${comment.articleUuid}`]).toEqual(
      JSON.stringify(comment)
    );

    // Cached user with primary key correctly loaded
    expect((await CachedUser.cache().findByPk(1)).get()).toEqual(
      user.get()
    );

    // Cached entity correctly loaded using custom primary key
    expect((await CachedArticle.cache().findByPk(article.uuid)).get()).toEqual(
      article.get()
    );

    expect((await CachedGroup.cache().findByPk(1)).get()).toEqual(
      group.get()
    );
  });

  test('Upsert', async () => {
    const user = await CachedUser.cache().findByPk(1);

    await CachedUser.cache().upsert({
      id: 1,
      name: 'Ivan'
    });

    // Timestamps synced after upsert
    expect((await CachedUser.cache().findByPk(1)).get()).toEqual(
      (await CachedUser.findByPk(1))?.get()
    );

    await user.cache().reload();

    // User name was updated
    expect(user.name).toBe('Ivan');

    // User cached after upsert
    expect(cacheStore.User[1]).toEqual(
      JSON.stringify(user) // TODO fix loading superfluous data
    );

    const group = await CachedGroup.cache().findByPk(1);

    await CachedGroup.cache().upsert({
      id: 1,
      name: 'Group of best people'
    });

    expect((await CachedGroup.cache().findByPk(1)).get()).toEqual(
      (await CachedGroup.findByPk(1))?.get()
    );

    await group.cache().reload();
    expect(group.name).toBe('Group of best people');
  });

  test('findByPk', async () => {
    expect(await CachedUser.cache().findByPk(2)).toBeNull(); // Cache miss not causing any problem

    delete cacheStore.User[1];
    // Deleted so first find goes directly to DB & and second one retrieves from cache with association

    const getQuery = async () => {
      const user = await CachedUser.cache().findByPk(1, { include: [{ model: CachedArticle, as: 'Articles' }] });
      const articles = user.Articles[0].get();
      return articles;
    };

    const queryWithMiss = await getQuery();

    const queryWithHit = await getQuery();

    console.log(queryWithMiss);
    console.log(queryWithHit);

    // Retrieved user with Article association
    expect(await getQuery()).toEqual(
      await getQuery()
    );

    const getGroupQuery = async () => {
      const group = await CachedGroup.cache().findByPk(1, { include: [{ model: CachedUser, as: 'groupUsers' }] });
      return group.get().groupUsers[0].get().name;
    };
    expect(await getGroupQuery()).toBe(
      await getGroupQuery()
    );
  });

  test('cache -> findAll', async () => {
    const missingUsers = await CachedUser.cache('missingKey1').findAll({ where: { name: 'Not existent' } });

    // Cache miss not causing any problem
    expect(missingUsers).toEqual(
      []
    );

    const key = 'IvanUserCacheKey1';
    const getQuery = () => ({
      where: { name: 'Ivan' },
      include: [{ model: CachedArticle, as: 'Articles' }]
    });

    const [cacheMiss] = await CachedUser.cache(key).findAll(getQuery());
    const [cacheHit] = await CachedUser.cache(key).findAll(getQuery());
    const [dbValue] = await CachedUser.findAll(getQuery());

    // Returned value is the same, not matter if cache hit or miss
    expect(cacheMiss.get().Articles[0].get()).toEqual(
      cacheHit.get().Articles[0].get()
    );

    // 'Returned value is the same, as in db'
    expect(cacheHit.get().Articles[0].get()).toEqual(
      dbValue.get().Articles[0].get()
    );
  });

  test('cache -> findOne', async () => {
    const missingUser = await CachedUser.cache('MissingKey2').findOne({ where: { name: 'Not existent' } });

    expect(missingUser).toBeNull(); // Cache miss not causing any problem

    const key = 'IvanUserCacheKey2';
    const getQuery = () => ({
      where: { name: 'Ivan' },
      include: [{ model: CachedArticle, as: 'Articles' }]
    });

    const cacheMiss = await CachedUser.cache(key).findOne(getQuery());
    const cacheHit = await CachedUser.cache(key).findOne(getQuery());
    const dbValue = await CachedUser.findOne(getQuery());

    // Returned value is the same, not matter if cache hit or miss
    expect(cacheMiss.get().Articles[0].get().uuid).toBe(
      cacheHit.get().Articles[0].get().uuid
    );

    // Returned value is the same, as in db
    expect(cacheHit.get().Articles[0].get().uuid).toBe(
      dbValue?.get().Articles[0].get().uuid
    );
  });

  test('cache -> cache store', async () => {
    const key = 'ClearStoreUserCacheKey';

    const cachedUser = await CachedUser.cache(key).findOne({ where: { name: 'Ivan' } });
    const userFromDb = await CachedUser.findOne({ where: { name: 'Ivan' } });

    // User cached after find and present in key using cache store
    expect(userFromDb?.get()).toEqual(
      cachedUser.get()
    );
  });

  test('cache -> clear', async () => {
    const key = 'ClearUserCacheKey';

    const cachedUser = await CachedUser.cache(key).findOne({ where: { name: 'Ivan' } });
    const userFromDb = await CachedUser.findOne({ where: { name: 'Ivan' } });

    // User cached after find and present in key
    expect(userFromDb?.get()).toEqual(
      cachedUser.get()
    );

    await CachedUser.cache(key).clear();
    expect(cacheStore.User[key]).toBeUndefined(); // User was deleted from cache
  });
});

describe('Recursive include tests', () => {
  test('Nested include depth == 1', async () => {
    // get all users of a group
    const group = await CachedGroup.cache().create({
      id: 123,
      name: 'Crazy Bloggers1'
    });

    const user1 = await CachedUser.cache().create({
      id: 123,
      name: 'Bob1'
    });

    const user2 = await CachedUser.cache().create({
      id: 124,
      name: 'Alice1'
    });

    await group.setGroupUsers([user1, user2]);
    await group.cache().save();

    // From DB
    const groupFromDB = await CachedGroup.cache('CrazyBloggers12').findAll({
      include: [{
        model: CachedUser,
        as: 'groupUsers'
      }],
      where: { id: 123 }
    });

    // From cache
    const cachedGroup = await CachedGroup.cache('CrazyBloggers12').findAll({
      include: [{
        model: CachedUser,
        as: 'groupUsers'
      }],
      where: { id: 123 }
    });
    // comparing length at depth == 0
    expect(cachedGroup).toHaveLength(groupFromDB.length);
    // comparing dataValues at depth == 0
    expect(cachedGroup[0].get().id).toEqual(groupFromDB[0].get().id);
    expect(cachedGroup[0].get().name).toEqual(groupFromDB[0].get().name);
    // comparing length at depth == 1
    expect(cachedGroup[0].groupUsers).toHaveLength(groupFromDB[0].groupUsers.length);
    // comparing dataValues at depth == 1
    expect(cachedGroup[0].groupUsers[0].get().id).toEqual(groupFromDB[0].groupUsers[0].get().id);
    expect(cachedGroup[0].groupUsers[0].get().name).toEqual(groupFromDB[0].groupUsers[0].get().name);
  });

  test('Nested include depth == 2', async () => {
    // get all the articles written by all users in a group
    const group = await CachedGroup.cache().create({
      id: 10,
      name: 'Crazy Bloggers1'
    });

    const user1 = await CachedUser.cache().create({
      id: 10,
      name: 'Bob'
    });

    const article = await CachedArticle.cache().create({
      uuid: '2086c06e-9dd9-4ee3-84b9-9e415dfd9c4f',
      title: 'New article'
    });
    await user1.setArticles([article]);
    await user1.cache().save();

    const user2 = await CachedUser.cache().create({
      id: 11,
      name: 'Alice'
    });

    await group.setGroupUsers([user1, user2]);
    await group.cache().save();

    // Crazy Bloggers has Bob and Alice.
    // Bob has written one article. Alice has written none

    // From DB
    const groupFromDB = await CachedGroup.cache('CrazyBloggers1').findAll({
      include: [{
        model: CachedUser,
        as: 'groupUsers',
        include: [{
          model: CachedArticle,
          as: 'Articles'
        }]
      }],
      where: { id: 10 }
    });

    // From cache
    const cachedGroup = await CachedGroup.cache('CrazyBloggers1').findAll({
      include: [{
        model: CachedUser,
        as: 'groupUsers',
        include: [{
          model: CachedArticle,
          as: 'Articles'
        }]
      }],
      where: { id: 10 }
    });

    // comparing length at depth == 0
    expect(cachedGroup).toHaveLength(groupFromDB.length);
    // comparing dataValues at depth == 0 i.e. "Crazy Bloggers"
    expect(cachedGroup[0].get().id).toEqual(groupFromDB[0].get().id);
    expect(cachedGroup[0].get().name).toEqual(groupFromDB[0].get().name);
    // comparing length at depth == 1
    expect(cachedGroup[0].groupUsers).toHaveLength(groupFromDB[0].groupUsers.length);
    // comparing dataValues at depth == 1
    // Bob is present
    expect(cachedGroup[0].groupUsers[0].get().id).toEqual(groupFromDB[0].groupUsers[0].get().id);
    expect(cachedGroup[0].groupUsers[0].get().name).toEqual(groupFromDB[0].groupUsers[0].get().name);
    // Alice is present
    expect(cachedGroup[0].groupUsers[1].get().id).toEqual(groupFromDB[0].groupUsers[1].get().id);
    expect(cachedGroup[0].groupUsers[1].get().name).toEqual(groupFromDB[0].groupUsers[1].get().name);
    // Bob has an article; depth == 2
    expect(cachedGroup[0].groupUsers[0].Articles).toHaveLength(groupFromDB[0].groupUsers[0].Articles.length);
    expect(cachedGroup[0].groupUsers[0].Articles[0].get().uuid).toEqual(groupFromDB[0].groupUsers[0].Articles[0].get().uuid);
    expect(cachedGroup[0].groupUsers[0].Articles[0].get().title).toEqual(groupFromDB[0].groupUsers[0].Articles[0].get().title);
    // Alice has no article; depth == 2
    expect(cachedGroup[0].groupUsers[1].Articles).toEqual([]);
  });
});
