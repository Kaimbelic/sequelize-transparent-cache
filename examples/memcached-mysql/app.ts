import Memcached from 'memcached';
import { MemcachedAdaptor } from '../../packages/sequelize-transparent-cache-memcached/src';
import  sequelizeCache  from '../../packages/sequelize-transparent-cache/src';
import { Sequelize, Op } from 'sequelize';
import { User } from './models/user';

const memcached = new Memcached('localhost:11211');

const memcachedAdaptor = new MemcachedAdaptor({
  client: memcached as any,
  namespace: 'model',
  lifetime: 60 * 60
});

const { withCache } = sequelizeCache(memcachedAdaptor);

const sequelize = new Sequelize('database', 'root', 'password', {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306
});

// Register and wrap your models
// withCache() will add cache() methods to all models and instances in sequelize v4
const CachedUser = withCache(User.initModel(sequelize));

async function start() {
  await sequelize.sync({ force: true }); // This will drop and recreate all tables

  // Create user in db and in cache
  await CachedUser.cache().create({
    id: 1,
    name: 'Daniel'
  });

  // Load user from cache
  const user = await CachedUser.cache().findByPk(1);

  // Update in db and cache
  await user.cache().update({
    name: 'Vikki'
  });

  // Cache result of arbitrary query - requires cache key
  await CachedUser.cache('dan-users').findAll({
    where: {
      name: {
        [Op.like]: 'Dan'
      }
    }
  });

  process.exit();
}

start();
